from database import SessionLocal, Product

def add_new_product():
    # 1. Mở kết nối Database
    db = SessionLocal()
    
    try:
        # 2. Tạo sản phẩm mới
        new_item = Product(
            sku="NEW-PRO-001",
            name="Bàn phím MADHE",
            category="Electronics",
            stock=150,
            unit_cost=25.5,
            supplier="RFG"
        )
        
        # 3. Thêm vào và Lưu lại
        db.add(new_item)
        db.commit()
        print(f"✅ Đã thêm thành công sản phẩm: {new_item.name} (SKU: {new_item.sku})")
        
    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {e}")
        db.rollback()
    finally:
        db.close()

# Chạy hàm
if __name__ == "__main__":
    add_new_product()