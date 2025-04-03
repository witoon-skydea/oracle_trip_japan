// แสดงการยืนยันเมื่อต้องการลบข้อมูล
document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.btn-danger');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (!confirm('คุณแน่ใจหรือไม่ที่ต้องการลบแหล่งท่องเที่ยวนี้?')) {
        e.preventDefault();
      }
    });
  });
});