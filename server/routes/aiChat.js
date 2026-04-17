const express = require('express');
const router = express.Router();
const aiChatService = require('../services/aiChatService');
const authUnified = require('../middleware/authUnified');

/**
 * POST /api/ai-chat/message
 * Gửi tin nhắn cho AI chatbot
 * Hỗ trợ cả JWT (mobile) và Firebase Token (web)
 */
router.post('/message', authUnified, async (req, res) => {
    try {
        const { message } = req.body;
        const studentId = req.user.student_id; // Lấy từ token

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'Student ID not found. Please login again.'
            });
        }

        // Chat với AI
        const result = await aiChatService.chat(studentId, message.trim());

        res.json(result);
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * GET /api/ai-chat/suggestions
 * Lấy danh sách câu hỏi gợi ý
 */
router.get('/suggestions', (req, res) => {
    const suggestions = aiChatService.getSuggestedQuestions();
    res.json({
        success: true,
        suggestions: suggestions
    });
});

/**
 * GET /api/ai-chat/context/:studentId
 * Lấy context của sinh viên (để debug)
 */
router.get('/context/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const context = await aiChatService.getStudentContext(studentId);
        
        res.json({
            success: true,
            context: context
        });
    } catch (error) {
        console.error('Get Context Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
