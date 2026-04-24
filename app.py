"""
Grocery Management System - Flask Backend
SQLite database + expiry logic + REST API
"""

from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import date, datetime

app = Flask(__name__)
DB_PATH = "grocery.db"

# ─── Category → Emoji + Unsplash image keyword mapping ───────────────────────
CATEGORY_META = {
    "Dairy":      {"emoji": "🥛", "img": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80"},
    "Produce":    {"emoji": "🥦", "img": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80"},
    "Meat":       {"emoji": "🥩", "img": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=80"},
    "Bakery":     {"emoji": "🍞", "img": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80"},
    "Frozen":     {"emoji": "🧊", "img": "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=200&q=80"},
    "Pantry":     {"emoji": "🫙", "img": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&q=80"},
    "Beverages":  {"emoji": "🧃", "img": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80"},
    "Snacks":     {"emoji": "🍿", "img": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&q=80"},
    "Fruits":     {"emoji": "🍎", "img": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80"},
    "Vegetables": {"emoji": "🥕", "img": "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&q=80"},
    "Other":      {"emoji": "📦", "img": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80"},
}

ITEM_IMAGES = {
    "milk":       "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
    "bread":      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
    "egg":        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
    "eggs":       "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
    "butter":     "https://images.unsplash.com/photo-1589985270958-a6784cc0be23?w=200&q=80",
    "cheese":     "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80",
    "yogurt":     "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80",
    "chicken":    "https://images.unsplash.com/photo-1604503468506-a8da13d11bbc?w=200&q=80",
    "beef":       "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=200&q=80",
    "fish":       "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80",
    "apple":      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80",
    "banana":     "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80",
    "tomato":     "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&q=80",
    "onion":      "https://images.unsplash.com/photo-1508747703725-719777637510?w=200&q=80",
    "potato":     "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&q=80",
    "spinach":    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80",
    "rice":       "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80",
    "pasta":      "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=200&q=80",
    "orange":     "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=200&q=80",
    "carrot":     "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80",
    "coffee":     "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80",
    "juice":      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&q=80",
    "water":      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&q=80",
    "sugar":      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&q=80",
    "salt":       "https://images.unsplash.com/photo-1574482620881-3a8ee9b48879?w=200&q=80",
    "oil":        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80",
    "flour":      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=80",
    "lemon":      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200&q=80",
    "garlic":     "https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=200&q=80",
    "mushroom":   "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80",
    "grape":      "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&q=80",
    "strawberry": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&q=80",
    "mango":      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80",
}

def get_item_image(name, category):
    name_lower = name.lower()
    for keyword, url in ITEM_IMAGES.items():
        if keyword in name_lower:
            return url
    return CATEGORY_META.get(category, CATEGORY_META["Other"])["img"]

def get_category_emoji(category):
    return CATEGORY_META.get(category, CATEGORY_META["Other"])["emoji"]

# ─── DB Setup ─────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            category    TEXT DEFAULT 'Other',
            quantity    REAL DEFAULT 1,
            unit        TEXT DEFAULT 'units',
            expiry_date TEXT,
            added_on    TEXT DEFAULT (date('now'))
        )
    """)
    # Seed sample data if empty
    count = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
    if count == 0:
        today = date.today()
        def d(offset): return str(date.fromordinal(today.toordinal() + offset))
        samples = [
            ("Whole Milk",      "Dairy",     2,   "L",     d(2)),
            ("Greek Yogurt",    "Dairy",     3,   "cups",  d(0)),
            ("Chicken Breast",  "Meat",      500, "g",     d(-1)),
            ("Sourdough Bread", "Bakery",    1,   "loaf",  d(5)),
            ("Basmati Rice",    "Pantry",    5,   "kg",    d(180)),
            ("Fresh Spinach",   "Produce",   200, "g",     d(3)),
            ("Orange Juice",    "Beverages", 1,   "L",     d(7)),
            ("Cheddar Cheese",  "Dairy",     250, "g",     d(14)),
            ("Banana",          "Fruits",    6,   "pcs",   d(4)),
            ("Pasta",           "Pantry",    500, "g",     d(365)),
        ]
        conn.executemany(
            "INSERT INTO items (name,category,quantity,unit,expiry_date) VALUES (?,?,?,?,?)",
            samples
        )
    conn.commit()
    conn.close()

# ─── Expiry Logic ─────────────────────────────────────────────────────────────

def get_expiry_status(expiry_date_str):
    if not expiry_date_str:
        return {"label": "No Date", "tier": "none", "days": None, "badge": "badge-none"}
    try:
        expiry = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
    except ValueError:
        return {"label": "Invalid", "tier": "expired", "days": None, "badge": "badge-expired"}

    diff = (expiry - date.today()).days
    if diff < 0:
        return {"label": f"Expired {abs(diff)}d ago", "tier": "expired", "days": diff, "badge": "badge-expired"}
    elif diff == 0:
        return {"label": "Expires Today", "tier": "today",   "days": 0,    "badge": "badge-today"}
    elif diff <= 3:
        return {"label": f"{diff}d left",  "tier": "critical","days": diff, "badge": "badge-critical"}
    elif diff <= 7:
        return {"label": f"{diff}d left",  "tier": "soon",   "days": diff, "badge": "badge-soon"}
    else:
        return {"label": f"{diff}d left",  "tier": "good",   "days": diff, "badge": "badge-good"}

def enrich_item(row):
    item = dict(row)
    item["status"] = get_expiry_status(item.get("expiry_date"))
    item["image"]  = get_item_image(item["name"], item["category"])
    item["emoji"]  = get_category_emoji(item["category"])
    return item

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    conn = get_db()
    rows = conn.execute("SELECT * FROM items ORDER BY expiry_date ASC NULLS LAST").fetchall()
    conn.close()
    items = [enrich_item(r) for r in rows]

    stats = {
        "total":    len(items),
        "expired":  sum(1 for i in items if i["status"]["tier"] == "expired"),
        "today":    sum(1 for i in items if i["status"]["tier"] == "today"),
        "critical": sum(1 for i in items if i["status"]["tier"] == "critical"),
        "good":     sum(1 for i in items if i["status"]["tier"] in ("good","none")),
    }
    categories = list(CATEGORY_META.keys())
    return render_template("index.html", items=items, stats=stats, categories=categories)

@app.route("/api/items", methods=["GET"])
def api_get_items():
    conn = get_db()
    rows = conn.execute("SELECT * FROM items ORDER BY expiry_date ASC NULLS LAST").fetchall()
    conn.close()
    return jsonify([enrich_item(r) for r in rows])

@app.route("/api/items", methods=["POST"])
def api_add_item():
    data = request.json
    if not data.get("name"):
        return jsonify({"error": "Name required"}), 400
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO items (name,category,quantity,unit,expiry_date) VALUES (?,?,?,?,?)",
        (data["name"], data.get("category","Other"), data.get("quantity",1),
         data.get("unit","units"), data.get("expiry_date") or None)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM items WHERE id=?", (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(enrich_item(row)), 201

@app.route("/api/items/<int:item_id>", methods=["PUT"])
def api_update_item(item_id):
    data = request.json
    conn = get_db()
    conn.execute(
        "UPDATE items SET name=?,category=?,quantity=?,unit=?,expiry_date=? WHERE id=?",
        (data["name"], data.get("category","Other"), data.get("quantity",1),
         data.get("unit","units"), data.get("expiry_date") or None, item_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(enrich_item(row))

@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def api_delete_item(item_id):
    conn = get_db()
    conn.execute("DELETE FROM items WHERE id=?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/items/clear-expired", methods=["DELETE"])
def api_clear_expired():
    today = str(date.today())
    conn = get_db()
    cur = conn.execute("DELETE FROM items WHERE expiry_date < ?", (today,))
    conn.commit()
    conn.close()
    return jsonify({"deleted": cur.rowcount})

@app.route("/api/stats")
def api_stats():
    conn = get_db()
    rows = conn.execute("SELECT * FROM items").fetchall()
    conn.close()
    items = [enrich_item(r) for r in rows]
    return jsonify({
        "total":    len(items),
        "expired":  sum(1 for i in items if i["status"]["tier"] == "expired"),
        "today":    sum(1 for i in items if i["status"]["tier"] == "today"),
        "critical": sum(1 for i in items if i["status"]["tier"] == "critical"),
        "good":     sum(1 for i in items if i["status"]["tier"] in ("good","none")),
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)