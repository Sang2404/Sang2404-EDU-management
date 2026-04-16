const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require('../config/db');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

class AIChatService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }

    /**
     * Lấy thông tin điểm số của sinh viên
     */
    async getStudentContext(studentId) {
        try {
            // Lấy thông tin sinh viên
            const studentInfo = await pool.query(`
                SELECT u.full_name, s.gpa_accumulated, s.status, c.class_name
                FROM students s
                JOIN users u ON s.user_id = u.user_id
                LEFT JOIN classes c ON s.class_id = c.class_id
                WHERE s.student_id = $1
            `, [studentId]);

            // Lấy điểm các môn
            const grades = await pool.query(`
                SELECT 
                    sub.subject_name,
                    sub.subject_id,
                    sub.credits,
                    g.attendance,
                    g.midterm,
                    g.final,
                    g.total_10,
                    g.total_4,
                    g.grade_char,
                    g.status,
                    cs.semester,
                    cs.academic_year
                FROM grades g
                JOIN course_sections cs ON g.section_id = cs.section_id
                JOIN subjects sub ON cs.subject_id = sub.subject_id
                WHERE g.student_id = $1
                ORDER BY cs.academic_year DESC, cs.semester DESC
            `, [studentId]);

            // Tính toán thống kê
            const stats = this.calculateStats(grades.rows);

            return {
                student: studentInfo.rows[0],
                grades: grades.rows,
                stats: stats
            };
        } catch (error) {
            console.error('Error getting student context:', error);
            return null;
        }
    }

    /**
     * Tính toán thống kê điểm
     */
    calculateStats(grades) {
        if (!grades || grades.length === 0) {
            return {
                totalSubjects: 0,
                avgGrade: 0,
                highestGrade: 0,
                lowestGrade: 0,
                strongSubjects: [],
                weakSubjects: []
            };
        }

        const validGrades = grades.filter(g => g.total_10 !== null);
        
        if (validGrades.length === 0) {
            return {
                totalSubjects: grades.length,
                avgGrade: 0,
                highestGrade: 0,
                lowestGrade: 0,
                strongSubjects: [],
                weakSubjects: []
            };
        }

        const total = validGrades.reduce((sum, g) => sum + parseFloat(g.total_10), 0);
        const avg = total / validGrades.length;

        const sorted = [...validGrades].sort((a, b) => b.total_10 - a.total_10);
        
        return {
            totalSubjects: grades.length,
            avgGrade: avg.toFixed(2),
            highestGrade: sorted[0].total_10,
            lowestGrade: sorted[sorted.length - 1].total_10,
            strongSubjects: sorted.slice(0, 3).map(g => ({
                name: g.subject_name,
                grade: g.total_10
            })),
            weakSubjects: sorted.slice(-3).map(g => ({
                name: g.subject_name,
                grade: g.total_10
            }))
        };
    }

    /**
     * Tạo context prompt cho AI
     */
    buildContextPrompt(context) {
        if (!context) {
            return "Không có thông tin sinh viên.";
        }

        const { student, grades, stats } = context;

        let prompt = `Bạn là trợ lý học tập thông minh của hệ thống quản lý sinh viên.

THÔNG TIN SINH VIÊN:
- Họ tên: ${student?.full_name || 'N/A'}
- Lớp: ${student?.class_name || 'N/A'}
- GPA tích lũy: ${student?.gpa_accumulated || 'Chưa có'}
- Trạng thái: ${student?.status || 'N/A'}

THỐNG KÊ ĐIỂM SỐ:
- Tổng số môn đã học: ${stats.totalSubjects}
- Điểm trung bình: ${stats.avgGrade}/10
- Điểm cao nhất: ${stats.highestGrade}/10
- Điểm thấp nhất: ${stats.lowestGrade}/10

ĐIỂM MẠNH (Top 3):
${stats.strongSubjects.map(s => `- ${s.name}: ${s.grade}/10`).join('\n')}

ĐIỂM YẾU (Bottom 3):
${stats.weakSubjects.map(s => `- ${s.name}: ${s.grade}/10`).join('\n')}

CHI TIẾT ĐIỂM CÁC MÔN:
${grades.map(g => 
    `- ${g.subject_name} (${g.subject_id}): ${g.total_10 || 'Chưa có'}/10 ${g.grade_char ? `(${g.grade_char})` : ''}`
).join('\n')}

HƯỚNG DẪN TRẢ LỜI:
1. Luôn tham chiếu đến điểm số cụ thể của sinh viên
2. Đưa ra lời khuyên CỤ THỂ, HÀNH ĐỘNG ĐƯỢC
3. Động viên và tích cực
4. Nếu sinh viên hỏi về môn học mới, dự đoán dựa trên môn liên quan
5. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu
6. Sử dụng emoji phù hợp để thân thiện hơn

Hãy trả lời câu hỏi của sinh viên dựa trên thông tin trên.`;

        return prompt;
    }

    /**
     * Chat với AI
     */
    async chat(studentId, message) {
        try {
            // Lấy context của sinh viên
            const context = await this.getStudentContext(studentId);
            const contextPrompt = this.buildContextPrompt(context);

            // Tạo prompt đầy đủ
            const fullPrompt = `${contextPrompt}

SINH VIÊN HỎI: "${message}"

TRẢ LỜI:`;

            console.log(`🤖 AI đang tạo nội dung cho sinh viên ${studentId}...`);
            const startTime = Date.now();
            
            // Gọi Gemini AI
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const reply = response.text();
            
            const endTime = Date.now();
            console.log(`✅ AI phản hồi sau ${(endTime - startTime) / 1000}s`);

            return {
                success: true,
                reply: reply,
                context: {
                    hasGrades: context?.grades?.length > 0,
                    avgGrade: context?.stats?.avgGrade
                }
            };
        } catch (error) {
            console.error('AI Chat Error:', error);
            
            // Fallback response nếu API lỗi
            return {
                success: false,
                reply: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ giảng viên để được hỗ trợ.",
                error: error.message
            };
        }
    }

    /**
     * Gợi ý câu hỏi mẫu
     */
    getSuggestedQuestions() {
        return [
            "Điểm của tôi thế nào?",
            "Tôi nên học môn gì kỳ sau?",
            "Làm sao để cải thiện điểm?",
            "Tại sao tôi yếu môn này?",
            "So với bạn bè tôi ra sao?",
            "Tôi có nguy cơ rớt môn không?",
            "Môn nào phù hợp với tôi?",
            "Làm sao để lên GPA 3.5?"
        ];
    }
}

module.exports = new AIChatService();
