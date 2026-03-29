import random
from datetime import datetime, timedelta
from database import SessionLocal, Product, Order, User

def generate_mock_data():
    db = SessionLocal()

    # 1. Tạo User test nếu chưa có
    test_user_id = "1"
    if not db.query(User).filter(User.id == test_user_id).first():
        db.add(User(id=test_user_id, email="admin@smartstock.com", name="Admin Manager", picture=""))
        db.commit()

    # 2. Danh sách 20 sản phẩm đa dạng
    mock_products = [
        {"sku": "LAP-001", "name": "MacBook Pro M2", "cat": "Electronics", "cost": 1200, "supplier": "Apple Inc."},
        {"sku": "LAP-002", "name": "Dell XPS 15", "cat": "Electronics", "cost": 1500, "supplier": "Dell VN"},
        {"sku": "AUD-001", "name": "AirPods Pro 2", "cat": "Audio", "cost": 200, "supplier": "Apple Inc."},
        {"sku": "AUD-002", "name": "Sony WH-1000XM5", "cat": "Audio", "cost": 300, "supplier": "Sony Corp"},
        {"sku": "AUD-003", "name": "JBL Flip 6", "cat": "Audio", "cost": 100, "supplier": "JBL VN"},
        {"sku": "ACC-001", "name": "Chuột Logitech MX Master 3", "cat": "Accessories", "cost": 80, "supplier": "Logitech"},
        {"sku": "ACC-002", "name": "Bàn phím cơ Keychron K8", "cat": "Accessories", "cost": 75, "supplier": "Keychron"},
        {"sku": "ACC-003", "name": "Cáp sạc Anker USB-C", "cat": "Accessories", "cost": 15, "supplier": "Anker VN"},
        {"sku": "MON-001", "name": "Màn hình LG 27 inch 4K", "cat": "Monitors", "cost": 350, "supplier": "LG Electronics"},
        {"sku": "MON-002", "name": "Màn hình Dell UltraSharp 24", "cat": "Monitors", "cost": 250, "supplier": "Dell VN"},
        {"sku": "OFF-001", "name": "Ghế công thái học Herman Miller", "cat": "Office", "cost": 900, "supplier": "ErgoLife"},
        {"sku": "OFF-002", "name": "Bàn nâng hạ Epione", "cat": "Office", "cost": 400, "supplier": "Epione"},
        {"sku": "GAM-001", "name": "PS5 Standard Edition", "cat": "Gaming", "cost": 450, "supplier": "Sony Corp"},
        {"sku": "GAM-002", "name": "Nintendo Switch OLED", "cat": "Gaming", "cost": 320, "supplier": "Nintendo"},
        {"sku": "GAM-003", "name": "Tay cầm Xbox Series X", "cat": "Gaming", "cost": 60, "supplier": "Microsoft"},
        {"sku": "SMR-001", "name": "Apple Watch Series 8", "cat": "Wearables", "cost": 350, "supplier": "Apple Inc."},
        {"sku": "SMR-002", "name": "Garmin Fenix 7", "cat": "Wearables", "cost": 600, "supplier": "Garmin"},
        {"sku": "NET-001", "name": "Router Wifi 6 Asus", "cat": "Networking", "cost": 120, "supplier": "Asus"},
        {"sku": "NET-002", "name": "Mesh Wifi TP-Link Deco", "cat": "Networking", "cost": 150, "supplier": "TP-Link"},
        {"sku": "STR-001", "name": "Ổ cứng SSD Samsung 1TB", "cat": "Storage", "cost": 90, "supplier": "Samsung"},
    ]

    # Thêm sản phẩm vào DB (Random tồn kho hiện tại từ 0 đến 100)
    for p in mock_products:
        if not db.query(Product).filter(Product.sku == p["sku"]).first():
            new_prod = Product(
                sku=p["sku"], name=p["name"], category=p["cat"], 
                stock=random.randint(0, 100), unit_cost=p["cost"], 
                supplier=p["supplier"], user_id=test_user_id
            )
            db.add(new_prod)
    db.commit()

    # 3. Tạo 500 lịch sử bán hàng (order_type = 'sell') ngẫu nhiên trong 30 ngày qua
    skus = [p["sku"] for p in mock_products]
    now = datetime.now()
    
    for _ in range(500):
        random_sku = random.choice(skus)
        # Random thời gian trong 30 ngày qua
        random_days_ago = random.randint(0, 30)
        random_date = now - timedelta(days=random_days_ago)
        qty = random.randint(1, 5) # Mỗi đơn mua từ 1 đến 5 cái
        
        order = Order(
            user_id=test_user_id,
            sku=random_sku,
            order_type="sell",
            quantity=qty,
            created_at=random_date,
            total_value=qty * 100 # Mô phỏng
        )
        db.add(order)
    
    db.commit()
    print("✅ Đã tạo xong 20 sản phẩm và 500 lịch sử giao dịch!")
    db.close()

if __name__ == "__main__":
    generate_mock_data()