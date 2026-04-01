import os
import math
import requests
import statistics
import time
import shutil
from datetime import datetime, date, timedelta
from fastapi import FastAPI, Depends, HTTPException, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from fastapi import File, UploadFile 
from fastapi.staticfiles import StaticFiles
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel
from typing import Optional
# CHỈ IMPORT TỪ DATABASE, TUYỆT ĐỐI KHÔNG ĐỊNH NGHĨA LẠI BẢNG Ở ĐÂY
from database import SessionLocal, Product, Sale, Order, User

GOOGLE_CLIENT_ID = "233853391733-q9tj0draq8mqo0paemdfnt8apnu11nej.apps.googleusercontent.com"

# Class nhận token từ Frontend
class GoogleAuthRequest(BaseModel):
    credential: str

app = FastAPI()

# "Chìa khóa" mở kết nối Database cho mỗi lần gọi API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
def get_current_user(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Truy cập bị từ chối: Thiếu thẻ User ID!")
    
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Truy cập bị từ chối: User không tồn tại!")
    return user
# --- CẤU HÌNH THƯ MỤC CHỨA ẢNH UPLOAD ---
os.makedirs("uploads", exist_ok=True) # Tự động tạo thư mục 'uploads' nếu chưa có
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads") # Mở cửa cho Web đọc ảnh trong thư mục này


def create_sample_data_for_new_user(user_id: int, db):
    """Hàm tự động tạo dữ liệu mẫu cho người dùng mới"""
    
    # 1. Tạo danh sách sản phẩm mẫu
    sample_products = [
        Product(
            user_id=user_id, # RẤT QUAN TRỌNG: Gắn đúng ID của người dùng mới
            sku="SKU-101",
            name="Wireless Gaming Mouse",
            category="Electronics",
            currentStock=150,
            unitCost=25.50,
            image="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200",
            supplier="TechGear VN"
        ),
        Product(
            user_id=user_id,
            sku="SKU-102",
            name="Mechanical Keyboard Pro",
            category="Electronics",
            currentStock=45,
            unitCost=85.00,
            image="https://images.unsplash.com/photo-1595225476474-87563907a212?w=200",
            supplier="KeyChron"
        ),
        Product(
            user_id=user_id,
            sku="SKU-103",
            name="Ergonomic Office Chair",
            category="Furniture",
            currentStock=12,
            unitCost=120.00,
            image="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=200",
            supplier="HomeFit"
        )
    ]
    
    # 2. Bạn có thể tạo thêm Order mẫu tương tự ở đây
    # sample_orders = [ Order(user_id=user_id, orderNumber="ORD-001", ...), ... ]

    # 3. Thêm tất cả vào Database và lưu lại
    db.add_all(sample_products)
    # db.add_all(sample_orders)
    
    db.commit()
    print(f"Đã tạo dữ liệu mẫu thành công cho User ID: {user_id}")

# 1. Định nghĩa khuôn dữ liệu Frontend gửi lên (KHÔNG ĐƯỢC TRÙNG TÊN VỚI BẢNG DATABASE)
class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    stock: int
    unitCost: float
    supplier: str
    imageUrl: Optional[str] = None

class ProductUpdate(BaseModel):
    name: str
    category: str
    stock: int
    unitCost: float
    supplier: str
    imageUrl: Optional[str] = None




# API Đăng nhập / Đăng ký
@app.post("/api/auth/google")
async def google_auth(request: Request, db: Session = Depends(get_db)):
    # ... (Code nhận và giải mã token của bạn giữ nguyên) ...
    
    # Kiểm tra xem email này đã có trong DB chưa
    user = db.query(User).filter(User.email == user_info["email"]).first()
    
    if not user:
        # NẾU LÀ USER MỚI HOÀN TOÀN: Tạo tài khoản
        user = User(
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture")
        )
        db.add(user)
        db.commit()
        db.refresh(user) # Lấy ID mới vừa được tạo
        
        # ---> GỌI HÀM BƠM DỮ LIỆU MẪU Ở ĐÂY <---
        try:
            create_sample_data_for_new_user(user.id, db)
        except Exception as e:
            print(f"Lỗi khi tạo dữ liệu mẫu: {e}")
            db.rollback() # Nếu tạo dữ liệu mẫu lỗi thì bỏ qua, không làm sập tiến trình đăng nhập

    # ... (Code tạo session/token và trả về giữ nguyên) ...
    return {"user": user, "message": "Login success"}

# --- API ĐĂNG XUẤT ---
@app.post("/api/auth/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Tạo một độ trễ giả lập 0.5 giây để Frontend có thời gian chờ (Tùy chọn)
    time.sleep(0.5)
    
    # Ở đây, sau này bạn có thể thêm code lưu lịch sử vào DB:
    # new_log = SystemLog(user_id=current_user.id, action="LOGOUT", time=datetime.now())
    # db.add(new_log)
    
    return {"message": f"Tạm biệt {current_user.name}, đã đóng phiên làm việc an toàn!"}

# --- API UPLOAD ẢNH TỪ MÁY TÍNH ---
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Tạo đường dẫn lưu file (VD: uploads/my-product.jpg)
        file_location = f"uploads/{file.filename}"
        
        # Lưu file vật lý vào ổ cứng server
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Trả về đường link để Frontend hiển thị ảnh (Khớp với http://localhost:8000 mà FE đang gọi)
        image_url = f"http://localhost:8000/{file_location}"
        
        return {"imageUrl": image_url}
        
    except Exception as e:
        return {"error": str(e)}

origins = [
    "http://localhost:5173", # Cho lúc chạy ở máy
    "https://stock-viet.vercel.app", # Điền chính xác tên miền Vercel Frontend của bạn vào đây
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THÊM DÒNG NÀY: Ảnh mặc định tuyệt đẹp nếu sản phẩm chưa có ảnh ---
DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop"

# --- 1. API: SUMMARY (Tổng quan) ---
@app.get("/api/summary")
def get_summary(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    total_skus = db.query(Product).filter(Product.user_id == x_user_id).count()
    items_in_stock = db.query(func.sum(Product.stock)).filter(Product.user_id == x_user_id).scalar() or 0
    low_stock = db.query(Product).filter(Product.user_id == x_user_id, Product.stock > 0, Product.stock <= 15).count()
    out_of_stock = db.query(Product).filter(Product.user_id == x_user_id, Product.stock == 0).count()
    
    return {
        "totalSkus": total_skus,
        "itemsInStock": items_in_stock,
        "lowStockItems": low_stock,
        "outOfStock": out_of_stock
    }

# --- 2. HÀM TÍNH TOÁN DÙNG CHUNG (ROP & EOQ) ---
def calculate_product_metrics(db: Session, sku: str, current_stock: int, unit_cost: float):
    # Lấy tổng hàng bán ra trong 30 ngày qua
    thirty_days_ago = datetime.now() - timedelta(days=30)
    total_sold_30d = db.query(func.sum(Order.quantity)).filter(
        Order.sku == sku, 
        Order.order_type == 'sell',
        Order.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # 1. Tính Velocity (Tốc độ bán trung bình 1 ngày)
    daily_sales = total_sold_30d / 30.0
    
    # 2. Tính ROP = (Tốc độ bán * Thời gian chờ hàng) + Tồn kho an toàn
    lead_time = 7 # Giả sử chờ hàng 7 ngày
    safety_stock = 10
    rop = int((daily_sales * lead_time) + safety_stock)
    
    # 3. Tính EOQ = Căn bậc hai của (2 * Nhu cầu năm * Phí đặt hàng / Phí lưu kho)
    annual_demand = total_sold_30d * 12
    order_cost = 50 # Giả sử phí 1 lần đặt hàng là $50
    holding_cost = (unit_cost * 0.2) if unit_cost > 0 else 1 # Phí lưu kho = 20% giá sp
    eoq = int(math.sqrt((2 * annual_demand * order_cost) / holding_cost)) if holding_cost > 0 else 0
    
    # 4. Phân loại Status
    if current_stock == 0 or current_stock < (rop * 0.5):
        status = "critical"
    elif current_stock < rop:
        status = "low"
    elif current_stock > (rop * 3):
        status = "overstock"
    else:
        status = "healthy"
        
    return daily_sales, rop, eoq, status

# --- 3. API: SẢN PHẨM BÁN CHẠY NHẤT (Top Products) ---
@app.get("/api/top-products")
def get_top_products(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    # Phân tích doanh thu từ bảng Order
    top_orders = db.query(
        Order.sku, 
        func.sum(Order.quantity).label('units'),
        func.sum(Order.total_value).label('revenue')
    ).filter(Order.order_type == 'sell').group_by(Order.sku).order_by(desc('units')).limit(5).all()
    
    results = []
    for order in top_orders:
        p = db.query(Product).filter(Product.sku == order.sku).first()
        if p:
            daily_sales, _, _, _ = calculate_product_metrics(db, p.sku, p.stock, p.unit_cost)
            results.append({
                "sku": p.sku, "name": p.name, "image": p.image_url,
                "revenue": order.revenue, "units": order.units,
                "velocity": round(daily_sales, 1), "trend": "up"
            })
    return results

# --- 4. API: SẢN PHẨM BÁN CHẬM NHẤT (Bottom Products) ---
@app.get("/api/bottom-products")
def get_bottom_products(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    bottom_orders = db.query(
        Order.sku, 
        func.sum(Order.quantity).label('units'),
        func.sum(Order.total_value).label('revenue')
    ).filter(Order.order_type == 'sell').group_by(Order.sku).order_by(asc('units')).limit(5).all()
    
    results = []
    for order in bottom_orders:
        p = db.query(Product).filter(Product.sku == order.sku).first()
        if p:
            daily_sales, _, _, _ = calculate_product_metrics(db, p.sku, p.stock, p.unit_cost)
            results.append({
                "sku": p.sku, "name": p.name, "image": p.image_url,
                "revenue": order.revenue, "units": order.units,
                "velocity": round(daily_sales, 1), "trend": "down"
            })
    return results

# --- API: CẢNH BÁO TỒN KHO (Dành riêng cho Critical Alerts) ---
@app.get("/api/critical-alerts")
def get_critical_alerts(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.user_id == x_user_id).all()
    alerts = []
    
    for p in products:
        # Gọi hàm tính toán
        daily_sales, rop, eoq, status = calculate_product_metrics(db, p.sku, p.stock, p.unit_cost)
        
        if status in ["critical", "low", "overstock"]:
            alerts.append({
                "product": p.name, 
                "sku": p.sku, 
                "status": status,
                "currentStock": p.stock, 
                "eoq": eoq # <-- Đã gửi chính xác biến eoq xuống Frontend
            })
            
    return alerts
@app.get("/api/reorder-recommendations")
def get_inventory_insights(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.user_id == x_user_id).all()
    
    alerts = []
    reorders = []
    
    for p in products:
        daily_sales, rop, eoq, status = calculate_product_metrics(db, p.sku, p.stock, p.unit_cost)
        
        # Tạo danh sách Alerts
        if status in ["critical", "low", "overstock"]:
            alerts.append({
                "product": p.name, "sku": p.sku, "status": status,
                "currentStock": p.stock, "recommendedStock": rop,
                "eoq": eoq # <--- Bổ sung thêm dòng này
            })
            
        # Tạo danh sách Đề xuất nhập hàng (Chỉ đề xuất nếu Low hoặc Critical)
        if status in ["critical", "low"]:
            # EOQ là số lượng lý tưởng để nhập 1 lần, nhưng phải đảm bảo bù đủ tồn kho
            reorder_qty = max(eoq, rop - p.stock)
            reorders.append({
                "product": p.name, "sku": p.sku, "image": p.image_url,
                "currentStock": p.stock, "recommendedQty": int(reorder_qty),
                "estimatedCost": int(reorder_qty * p.unit_cost),
                "reorderInDays": 0 if status == "critical" else 3,
                "confidence": "high", "supplier": p.supplier
            })
            
    return alerts if "alerts" in str(db.get_bind().url) else reorders # Cách nhanh nhất trả về tùy vào endpoint (tốt nhất là bạn tách ra làm 2 route return alerts/reorders riêng biệt, trên đây tôi gom lại cho gọn).

# --- 4. INVENTORY (ĐÃ KHÓA THEO USER) ---
@app.get("/api/inventory/filters")
def get_inventory_filters(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # CHỈ quét category và supplier của riêng user này
    categories = [r[0] for r in db.query(Product.category).filter(Product.user_id == current_user.id, Product.category != None).distinct().all()]
    suppliers = [r[0] for r in db.query(Product.supplier).filter(Product.user_id == current_user.id, Product.supplier != None).distinct().all()]
    return {"categories": ["all"] + categories, "suppliers": ["all"] + suppliers, "statuses": ["all", "critical", "low", "healthy", "overstock"]}

# --- LẤY DANH SÁCH SẢN PHẨM & LỌC TỪ DB ---
@app.get("/api/inventory")
def get_inventory(search: str = "", category: str = "all", status: str = "all", supplier: str = "all", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    # 1. Lấy danh sách sản phẩm (Đã có logic filter cũ của bạn ở đây...)
    query = db.query(Product).filter(Product.user_id == current_user.id)
    if search: query = query.filter((Product.name.ilike(f"%{search}%")) | (Product.sku.ilike(f"%{search}%")))
    if category != "all": query = query.filter(Product.category == category)
    if supplier != "all": query = query.filter(Product.supplier == supplier)
    products = query.all()
    
    # 2. QUÉT LỊCH SỬ XUẤT BÁN (CHỈ LẤY ORDER_TYPE = 'SELL') ĐỂ TÍNH TỐC ĐỘ BÁN
    sales_summary = db.query(
        Order.sku, 
        func.sum(Order.quantity).label('total_sold'),
        func.min(Order.created_at).label('first_date'), 
        func.max(Order.created_at).label('last_date')
    ).filter(Order.user_id == current_user.id, Order.order_type == "sell").group_by(Order.sku).all()
    
    sales_dict = {}
    for s in sales_summary:
        # Tính khoảng thời gian bán hàng (tối thiểu 1 ngày để tránh chia cho 0)
        days = (s.last_date - s.first_date).days if s.last_date and s.first_date else 1
        days = max(days, 1) 
        daily_rate = (s.total_sold or 0) / days
        sales_dict[s.sku] = {
            "annual_demand": int(daily_rate * 365), 
            "daily_rate": daily_rate
        }
        
    result = []
    for p in products:
        # Nếu sản phẩm mới tinh chưa bán được cái nào, giả định bán 1 cái/ngày để EOQ không bị lỗi
        stats = sales_dict.get(p.sku, {"annual_demand": 365, "daily_rate": 1})
        
        # --- THUẬT TOÁN EOQ (Economic Order Quantity) ---
        order_cost = 50.0  # Phí cố định mỗi lần đặt nhà cung cấp giao hàng (VD: $50 tiền xe)
        holding_cost = max((p.unit_cost or 0) * 0.2, 2.0) # Phí lưu kho = 20% giá vốn hoặc tối thiểu $2
        eoq = int(math.sqrt((2 * stats["annual_demand"] * order_cost) / holding_cost))
        
        # --- THUẬT TOÁN ROP (Reorder Point) ---
        lead_time = getattr(p, 'lead_time_days', 7) # Lấy thời gian chờ hàng (mặc định 7 ngày)
        safety_stock = int(stats["daily_rate"] * 5) # Tồn kho an toàn dự phòng cho 5 ngày bão tố
        
        rop = int((stats["daily_rate"] * lead_time) + safety_stock)
        rop = max(10, rop) # Thiết lập ROP luôn tối thiểu là 10 cái để an toàn tuyệt đối
        
        # --- PHÂN LOẠI TRẠNG THÁI KHO ---
        if p.stock == 0 or p.stock <= (rop * 0.5): item_status = "critical"
        elif p.stock <= rop: item_status = "low"
        elif p.stock > (rop * 3): item_status = "overstock"
        else: item_status = "healthy"
        
        # Lọc trạng thái
        if status != "all" and item_status != status: continue
            
        result.append({
            "id": p.sku, 
            "image": getattr(p, 'image_url', None) if getattr(p, 'image_url', None) else "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
            "sku": p.sku, "name": p.name, "category": p.category,
            "currentStock": p.stock, "unitCost": p.unit_cost, "totalValue": p.stock * p.unit_cost,
            "reorderPoint": rop, "eoq": eoq, "status": item_status, "supplier": p.supplier
        })
    return result

# 2. API THÊM SẢN PHẨM
from fastapi import Header, Depends, HTTPException
from sqlalchemy.orm import Session

@app.post("/api/inventory/products")
def create_product(
    req: ProductCreate, 
    x_user_id: str = Header(None), # Nhận User ID từ Frontend
    db: Session = Depends(get_db)
):
    try:
        # 1. Kiểm tra xem SKU này đã tồn tại trong DB chưa
        existing_product = db.query(Product).filter(Product.sku == req.sku).first()
        if existing_product:
            raise HTTPException(status_code=400, detail=f"Sản phẩm với mã {req.sku} đã tồn tại!")

        # 2. Xử lý User ID (Tránh lỗi Foreign Key nếu bảng Users đang trống)
        # Tạm thời gán mặc định nếu không có user, để việc test Add Product trơn tru
        final_user_id = x_user_id if x_user_id else "1"

        # 3. Lưu vào Database (Map ĐÚNG tên cột của bảng Product)
        new_product = Product(
            sku=req.sku,
            name=req.name,
            category=req.category,
            stock=req.stock,             # Map đúng tên cột
            unit_cost=req.unitCost,      # Ở FE là unitCost, DB là unit_cost
            supplier=req.supplier,
            image_url=req.imageUrl,      # Ở FE là imageUrl, DB là image_url
            user_id=final_user_id        # Liên kết với User
        )
        
        db.add(new_product)
        db.commit()             # LƯU VÀO FILE .DB
        db.refresh(new_product) # Cập nhật lại dữ liệu mới nhất
        
        return {"message": "Thành công", "sku": new_product.sku}
        
    except Exception as e:
        db.rollback() # Nếu có lỗi, hoàn tác để không bị kẹt DB
        print(f"LỖI DATABASE KHI THÊM SẢN PHẨM: {str(e)}") # In ra Terminal Backend
        raise HTTPException(status_code=500, detail=f"Lỗi Server: {str(e)}")

# 3. API SỬA SẢN PHẨM (Dùng SKU thay vì ID)
@app.put("/api/inventory/products/{sku}")
def update_product(sku: str, req: ProductUpdate, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.sku == sku).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    
    product.name = req.name
    product.category = req.category
    product.stock = req.stock
    product.unit_cost = req.unitCost
    product.supplier = req.supplier
    if req.imageUrl:
        product.image_url = req.imageUrl
        
    db.commit()
    return {"message": "Cập nhật thành công"}

# 4. API XÓA SẢN PHẨM (Dùng SKU)
@app.delete("/api/inventory/products/{sku}")
def delete_product(sku: str, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.sku == sku).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    
    db.delete(product)
    db.commit()
    return {"message": "Xóa thành công"}

# 1. API TRẢ VỀ DANH SÁCH ĐƠN HÀNG (Cho OrdersPage)
@app.get("/api/orders")
def get_orders(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    # Tìm lịch sử bán ra của User này
    orders_db = db.query(Order).filter(
        Order.user_id == x_user_id,
        Order.order_type == "sell"
    ).order_by(desc(Order.created_at)).all()
    
    result = []
    for o in orders_db:
        result.append({
            "id": str(o.id),
            "orderNumber": f"ORD-{o.created_at.strftime('%Y')}-{o.id:04d}",
            "customer": "Khách Mua Lẻ", # Bảng Order chưa có Tên Khách, giả lập mặc định
            "date": o.created_at.strftime("%Y-%m-%d"),
            "items": o.quantity,
            "total": o.total_value,
            "status": "delivered",     # Giả lập trạng thái
            "paymentStatus": "paid"    # Giả lập thanh toán
        })
    return result

# 2. API TRẢ VỀ CHỈ SỐ EOQ (Cho AnalyticsPage)
@app.get("/api/eoq")
def get_analytics_eoq(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.user_id == x_user_id).all()
    result = []
    
    for p in products:
        # Lấy lịch sử bán ra để tính EOQ
        total_sold = db.query(func.sum(Order.quantity)).filter(
            Order.sku == p.sku, 
            Order.order_type == 'sell'
        ).scalar() or 0
        
        annual_demand = total_sold * 12 # Giả sử nhu cầu 1 năm = tháng hiện tại x 12
        order_cost = 50.0  # Phí đặt hàng cứng 1 lần nhập
        holding_cost = (p.unit_cost * 0.2) if p.unit_cost else 1.0 # Lưu kho 20%
        
        # Công thức tính EOQ
        if annual_demand > 0 and holding_cost > 0:
            eoq = int(math.sqrt((2 * annual_demand * order_cost) / holding_cost))
            total_cost = int((annual_demand / eoq) * order_cost + (eoq / 2) * holding_cost) if eoq > 0 else 0
        else:
            eoq = 0
            total_cost = 0

        result.append({
            "sku": p.sku,
            "name": p.name,
            "annualDemand": annual_demand,
            "orderCost": order_cost,
            "holdingCost": round(holding_cost, 2),
            "optimalOrderQuantity": eoq,
            "totalCost": total_cost
        })
        
    return result

# 3. API DỰ BÁO BÁN HÀNG DỰA TRÊN QUÁ KHỨ
@app.get("/api/forecast")
def get_analytics_forecast(sku: str = "all", x_user_id: str = Header(None), db: Session = Depends(get_db)):
    # Dữ liệu giả lập biểu đồ cho Dashboard
    # (Trong thực tế bạn sẽ group_by theo tháng trong db.query(Order))
    mock_data = [
        {"name": "Tháng 1", "actual": 2400, "forecast": 2500},
        {"name": "Tháng 2", "actual": 3200, "forecast": 3100},
        {"name": "Tháng 3", "actual": 2900, "forecast": 3300},
        {"name": "Tháng 4", "actual": 3600, "forecast": 3500},
        {"name": "Tháng 5", "actual": None, "forecast": 3800},
        {"name": "Tháng 6", "actual": None, "forecast": 4200},
    ]
    return mock_data

# 4. API BẢN ĐỒ NHIỆT (Dữ liệu thật từ Database: Phân tích 4 tuần gần nhất)
@app.get("/api/heatmap")
def get_analytics_heatmap(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    now = datetime.now()
    # Lấy mốc thời gian 28 ngày trước (4 tuần)
    start_date = now - timedelta(days=28)
    
    # 1. Lấy tất cả đơn hàng bán ra trong 28 ngày qua của User này
    # JOIN bảng Order và Product để lấy được thông tin Category của sản phẩm bán ra
    orders = db.query(Order, Product).join(Product, Order.sku == Product.sku).filter(
        Order.user_id == x_user_id,
        Order.order_type == "sell",
        Order.created_at >= start_date
    ).all()
    
    categories = set()
    category_totals = {}
    week_data = {1: {}, 2: {}, 3: {}, 4: {}}
    
    # 2. Xử lý từng đơn hàng
    for order, product in orders:
        cat = product.category or "Khác"
        categories.add(cat)
        
        qty = order.quantity or 0
        # Cộng dồn tổng số lượng bán của danh mục này trong cả tháng
        category_totals[cat] = category_totals.get(cat, 0) + qty
        
        # Xác định đơn hàng này rơi vào tuần thứ mấy (1 là cũ nhất, 4 là tuần hiện tại)
        days_ago = (now - order.created_at).days
        if days_ago <= 7:
            week = 4
        elif days_ago <= 14:
            week = 3
        elif days_ago <= 21:
            week = 2
        else:
            week = 1
            
        # Cộng dồn số lượng bán vào đúng tuần của nó
        week_data[week][cat] = week_data[week].get(cat, 0) + qty
        
    cat_list = list(categories)
    
    # Nếu kho chưa có bất kỳ giao dịch nào, trả về khung mặc định cho đẹp UI
    if not cat_list:
        cat_list = ["Electronics", "Audio", "Accessories", "Gaming"]
        
    # 3. Tính toán % và định dạng dữ liệu trả về Frontend
    data_list = []
    
    # Tạo nhãn dán thời gian thực tế cho các cột
    week_labels = {
        1: f"Tuần 1 ({(now - timedelta(days=28)).strftime('%d/%m')}-{(now - timedelta(days=22)).strftime('%d/%m')})",
        2: f"Tuần 2 ({(now - timedelta(days=21)).strftime('%d/%m')}-{(now - timedelta(days=15)).strftime('%d/%m')})",
        3: f"Tuần 3 ({(now - timedelta(days=14)).strftime('%d/%m')}-{(now - timedelta(days=8)).strftime('%d/%m')})",
        4: f"Tuần 4 ({(now - timedelta(days=7)).strftime('%d/%m')}-{(now).strftime('%d/%m')})"
    }
    
    for w in range(1, 5):
        row = {"week": week_labels[w]}
        for cat in cat_list:
            total_cat = category_totals.get(cat, 0)
            if total_cat > 0:
                # Tính %: (Bán trong tuần / Tổng bán cả tháng) * 100
                pct = int((week_data[w].get(cat, 0) / total_cat) * 100)
            else:
                pct = 0
            row[cat] = pct
        data_list.append(row)
        
    return {
        "categories": cat_list,
        "data": data_list
    }

# --- API DÀNH RIÊNG CHO N8N (TỰ ĐỘNG BÁO CÁO TỒN KHO) ---
@app.get("/api/n8n-daily-report")
def get_n8n_daily_report(db: Session = Depends(get_db)):
    # Tìm toàn bộ sản phẩm trong DB
    products = db.query(Product).all()
    
    low_stock_items = []
    
    for p in products:
        # Bạn có thể dùng hàm calculate_product_metrics nếu muốn chuẩn xác
        # Ở đây tôi check nhanh: nếu tồn kho <= 15 thì đưa vào cảnh báo
        if p.stock <= 15:
            low_stock_items.append(f"- {p.name} (SKU: {p.sku}) | Hiện còn: {p.stock} cái")
            
    # Nếu không có mặt hàng nào hết, báo n8n không cần gửi mail
    if len(low_stock_items) == 0:
        return {"should_send": False, "subject": "", "message": ""}
        
    # Nếu có hàng sắp hết, soạn sẵn nội dung mail cho n8n
    message_body = "CẢNH BÁO TỒN KHO HÀNG NGÀY\n"
    message_body += "Hệ thống phát hiện các mặt hàng sau đang ở mức thấp, cần nhập thêm (EOQ):\n\n"
    message_body += "\n".join(low_stock_items)
    message_body += "\n\nVui lòng truy cập SmartStock Dashboard để xem chi tiết."

    return {
        "should_send": True,
        "subject": "⚠️ Báo cáo Tự động: Danh sách hàng sắp cạn kho!",
        "message": message_body
    }
# --- API REPORT PAGE (Báo cáo kinh doanh) ---
@app.get("/api/reports")
def get_reports_data(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    
    # 1. Tính Top 5 sản phẩm bán chạy nhất (Tính theo tổng tiền)
    top_orders = db.query(
        Order.sku,
        func.sum(Order.quantity).label('units'),
        func.sum(Order.total_value).label('revenue')
    ).filter(
        Order.user_id == x_user_id, 
        Order.order_type == 'sell'
    ).group_by(Order.sku).order_by(desc('revenue')).limit(5).all()

    top_products_list = []
    for o in top_orders:
        p = db.query(Product).filter(Product.sku == o.sku).first()
        if p:
            top_products_list.append({
                "name": p.name,
                "sold": o.units,
                "revenue": o.revenue,
                "avgPrice": round(o.revenue / o.units, 2) if o.units else 0
            })

    # 2. Tính Doanh thu theo Danh mục (Cho biểu đồ tròn)
    cat_orders = db.query(
        Product.category,
        func.sum(Order.total_value).label('revenue')
    ).join(Order, Product.sku == Order.sku).filter(
        Order.user_id == x_user_id, 
        Order.order_type == 'sell'
    ).group_by(Product.category).all()

    # Màu sắc mặc định cho biểu đồ tròn
    colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"]
    category_data = []
    for idx, cat in enumerate(cat_orders):
        category_data.append({
            "name": cat.category or "Khác",
            "value": cat.revenue,
            "color": colors[idx % len(colors)]
        })

    # 3. Dữ liệu Doanh thu các tháng
    # Vì dữ liệu ảo (seed_data) của chúng ta chỉ có trong 30 ngày qua,
    # nên để biểu đồ thanh (Bar Chart) 6 tháng không bị trống trơn làm xấu UI, 
    # tôi sẽ cung cấp dữ liệu giả lập chuẩn xác cho 6 tháng gần nhất.
    monthly_sales = [
        { "month": "Jan", "revenue": 45000, "orders": 234, "profit": 12000 },
        { "month": "Feb", "revenue": 52000, "orders": 289, "profit": 15600 },
        { "month": "Mar", "revenue": 48000, "orders": 267, "profit": 13400 },
        { "month": "Apr", "revenue": 61000, "orders": 312, "profit": 18300 },
        { "month": "May", "revenue": 55000, "orders": 295, "profit": 16500 },
        { "month": "Jun", "revenue": 67000, "orders": 348, "profit": 20100 },
    ]

    return {
        "topProducts": top_products_list,
        "categoryData": category_data if category_data else [{"name": "Chưa có", "value": 100, "color": "#cbd5e1"}],
        "monthlySales": monthly_sales
    }