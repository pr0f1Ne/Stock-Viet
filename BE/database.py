from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

DATABASE_URL = "sqlite:///./erp_database.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 1. BẢNG USER ---
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    picture = Column(String)

# --- 2. BẢNG SẢN PHẨM ---
class Product(Base):
    __tablename__ = "products"
    sku = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String)
    stock = Column(Integer, default=0)
    unit_cost = Column(Float)
    supplier = Column(String)
    image_url = Column(String, nullable=True)
    user_id = Column(String, ForeignKey("users.id")) 
    
    # Thời gian chờ hàng về (Lead time) - Mặc định 7 ngày
    lead_time_days = Column(Integer, default=7) 

# --- 3. BẢNG ĐƠN HÀNG (Dùng để tính ROP/EOQ) ---
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    sku = Column(String, ForeignKey("products.sku"))
    order_type = Column(String) # 'buy' (nhập kho) hoặc 'sell' (xuất bán)
    quantity = Column(Integer)
    total_value = Column(Float)
    created_at = Column(DateTime, default=datetime.now)

# --- 4. BẢNG LỊCH SỬ BÁN (CŨ) ---
class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.now)
    sku = Column(String, ForeignKey("products.sku"))
    quantity = Column(Integer)
    revenue = Column(Float)
    user_id = Column(String, ForeignKey("users.id")) 

# Lệnh này tự động tạo file và các bảng
Base.metadata.create_all(bind=engine)