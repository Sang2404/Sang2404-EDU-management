/**
 * Test script cho AI Chat Service
 * Chạy: node test-ai-chat.js
 */

const aiChatService = require('./services/aiChatService');

async function test() {
    console.log('🧪 Testing AI Chat Service...\n');
    
    // Test với sinh viên có ID
    const studentId = '2224802010365';  // Sinh viên từ database
    
    console.log('📊 1. Lấy context sinh viên...');
    const context = await aiChatService.getStudentContext(studentId);
    
    if (context) {
        console.log('✅ Context loaded:');
        console.log('   - Sinh viên:', context.student?.full_name);
        console.log('   - GPA:', context.student?.gpa_accumulated);
        console.log('   - Số môn:', context.stats.totalSubjects);
        console.log('   - Điểm TB:', context.stats.avgGrade);
        console.log('   - Điểm mạnh:', context.stats.strongSubjects.map(s => s.name).join(', '));
        console.log('   - Điểm yếu:', context.stats.weakSubjects.map(s => s.name).join(', '));
    } else {
        console.log('❌ Không tìm thấy sinh viên');
        return;
    }
    
    console.log('\n💬 2. Test chat với AI...');
    
    const testQuestions = [
        "Điểm của tôi thế nào?",
        "Tôi nên học môn gì kỳ sau?",
        "Làm sao để cải thiện điểm?"
    ];
    
    for (const question of testQuestions) {
        console.log(`\n👤 Sinh viên: "${question}"`);
        console.log('🤖 AI đang suy nghĩ...');
        
        const result = await aiChatService.chat(studentId, question);
        
        if (result.success) {
            console.log('✅ Trả lời:');
            console.log(result.reply);
        } else {
            console.log('❌ Lỗi:', result.error);
        }
        
        // Đợi 2 giây giữa các câu hỏi (tránh rate limit)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ Test hoàn tất!');
    process.exit(0);
}

test().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
