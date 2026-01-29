require('dotenv').config({ path: '../.env' });
const pool = require('../config/db');

const faculties = [
    { id: 'KTTC', name: 'TRƯỜNG KINH TẾ TÀI CHÍNH' },
    { id: 'LQL', name: 'TRƯỜNG LUẬT VÀ QUẢN LÝ' },
    { id: 'VCNS', name: 'VIỆN CÔNG NGHỆ SỐ' },
    { id: 'VCNX', name: 'VIỆN CÔNG NGHỆ XANH VÀ BỀN VỮNG' },
    { id: 'VKTCN', name: 'VIỆN KỸ THUẬT CÔNG NGHỆ' },
    { id: 'KKTXD', name: 'KHOA KIẾN TRÚC - XÂY DỰNG' },
    { id: 'KNN', name: 'KHOA NGOẠI NGỮ' },
    { id: 'KSP', name: 'KHOA SƯ PHẠM' },
    { id: 'KCNVH', name: 'KHOA CÔNG NGHIỆP VĂN HÓA' }
];

const seedFaculties = async () => {
    try {
        console.log('🔄 Đang kết nối Database...');
        
        // Kiểm tra kết nối
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Kết nối thành công lúc:', res.rows[0].now);

        console.log('🗑️  Đang xóa danh sách Khoa/Viện cũ...');
        
        // 1.1 Update lecturers.faculty_id to NULL to avoid FK constraint
        await pool.query('UPDATE lecturers SET faculty_id = NULL');
        console.log('   - Đã gỡ liên kết Khoa khỏi Giảng viên (tạm thời)');

        // 1.2 Xóa dữ liệu cũ. (Majors có ON DELETE SET NULL nên tự động)
        await pool.query('DELETE FROM faculties');
        
        console.log('➕ Đang thêm danh sách mới...');
        for (const f of faculties) {
            await pool.query(
                'INSERT INTO faculties (faculty_id, faculty_name) VALUES ($1, $2)',
                [f.id, f.name]
            );
            console.log(`   - Đã thêm: ${f.name} (${f.id})`);
        }

        console.log('✅ Hoàn tất cập nhật danh sách Khoa/Viện!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedFaculties();
