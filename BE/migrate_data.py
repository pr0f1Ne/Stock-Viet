import pandas as pd
import os
from database import engine

# Tìm đúng vị trí file CSV
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(current_dir, "sales_data.csv")

print(f"Đang đọc dữ liệu từ: {csv_path}")

try:
    # Đọc CSV
    df = pd.read_csv(csv_path)
    
    # Bơm thẳng vào bảng 'orders' trong Database SQLite
    df.to_sql("orders", con=engine, if_exists="replace", index=False)
    
    print("🎉 TUYỆT VỜI! Đã đổ dữ liệu từ CSV vào Database thành công!")
except Exception as e:
    print(f"❌ Có lỗi xảy ra: {e}")