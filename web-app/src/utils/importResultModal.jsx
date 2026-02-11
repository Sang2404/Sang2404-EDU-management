import React from 'react';
import { Modal } from 'antd';

export const showImportResults = (results, entityName = 'bản ghi') => {
  if (results.errors.length > 0 || results.skipped.length > 0) {
    Modal.info({
      title: 'Kết quả nhập dữ liệu',
      width: 800,
      content: (
        <div>
          <p><strong>Thành công:</strong> {results.success.length} {entityName}</p>
          <p><strong>Bỏ qua:</strong> {results.skipped.length} {entityName}</p>
          <p><strong>Lỗi:</strong> {results.errors.length} {entityName}</p>
          
          {results.skipped.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>Dữ liệu bỏ qua (đã tồn tại và giống hệt):</h4>
              <div style={{ maxHeight: 150, overflow: 'auto' }}>
                {results.skipped.map((skip, idx) => (
                  <div key={idx} style={{ marginBottom: 8, padding: 8, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4 }}>
                    <strong>Dòng {skip.row}:</strong> {skip.reason}
                    <br />
                    <small>{JSON.stringify(skip.data)}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.errors.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>Lỗi:</h4>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {results.errors.map((err, idx) => (
                  <div key={idx} style={{ marginBottom: 8, padding: 8, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>
                    <strong>Dòng {err.row}:</strong> {err.error}
                    <br />
                    <small>{JSON.stringify(err.data)}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    });
    return true; // Modal was shown
  }
  return false; // No errors or skipped, caller should show success message
};
