from database import SessionLocal, Product, Order, User

def assign_data_to_real_user():
    db = SessionLocal()
    
    # Tìm tài khoản thật của bạn đang có trong Database
    real_user = db.query(User).filter(User.id != "1").first()
    
    if real_user:
        print(f"Đang chuyển toàn bộ dữ liệu kho cho tài khoản: {real_user.name}...")
        
        # Cập nhật ID chủ sở hữu cho toàn bộ Sản phẩm và Đơn hàng
        db.query(Product).update({"user_id": real_user.id})
        db.query(Order).update({"user_id": real_user.id})
        
        db.commit()
        print("✅ Hoàn tất! Bạn hãy quay lại web và bấm F5 (Tải lại trang) nhé.")
    else:
        print("❌ Chưa tìm thấy tài khoản thật của bạn. Bạn hãy ra web đăng nhập 1 lần trước khi chạy lệnh này nhé!")
        
    db.close()

if __name__ == "__main__":
    assign_data_to_real_user()