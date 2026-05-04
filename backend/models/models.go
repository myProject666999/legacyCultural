package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	Email     string         `json:"email" gorm:"size:100"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Avatar    string         `json:"avatar" gorm:"size:255"`
	Balance   float64        `json:"balance" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Admin struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	Role      string         `json:"role" gorm:"size:20;default:'admin'"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type ProductType struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	ParentID  uint           `json:"parent_id" gorm:"default:0"`
	Sort      int            `json:"sort" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	TypeID      uint           `json:"type_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"size:200;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Image       string         `json:"image" gorm:"size:500"`
	Images      string         `json:"images" gorm:"type:text"`
	Price       float64        `json:"price" gorm:"type:decimal(10,2);not null"`
	Stock       int            `json:"stock" gorm:"default:0"`
	Sales       int            `json:"sales" gorm:"default:0"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Address struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	Name      string         `json:"name" gorm:"size:50;not null"`
	Phone     string         `json:"phone" gorm:"size:20;not null"`
	Province  string         `json:"province" gorm:"size:50"`
	City      string         `json:"city" gorm:"size:50"`
	District  string         `json:"district" gorm:"size:50"`
	Detail    string         `json:"detail" gorm:"size:255;not null"`
	IsDefault int            `json:"is_default" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type Order struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	OrderNo     string         `json:"order_no" gorm:"uniqueIndex;size:50;not null"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	TotalPrice  float64        `json:"total_price" gorm:"type:decimal(10,2);not null"`
	Status      int            `json:"status" gorm:"default:0"`
	AddressID   uint           `json:"address_id"`
	AddressInfo string         `json:"address_info" gorm:"type:text"`
	PaymentTime *time.Time     `json:"payment_time"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type OrderItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	OrderID   uint      `json:"order_id" gorm:"not null;index"`
	ProductID uint      `json:"product_id" gorm:"not null"`
	Product   *Product  `json:"product" gorm:"-"`
	Quantity  int       `json:"quantity" gorm:"not null"`
	Price     float64   `json:"price" gorm:"type:decimal(10,2);not null"`
	CreatedAt time.Time `json:"created_at"`
}

type Favorite struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;uniqueIndex:idx_user_product"`
	ProductID uint      `json:"product_id" gorm:"not null;uniqueIndex:idx_user_product"`
	Product   *Product  `json:"product" gorm:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type Review struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	User      *User          `json:"user" gorm:"-"`
	ProductID uint           `json:"product_id" gorm:"not null;index"`
	OrderID   uint           `json:"order_id" gorm:"index"`
	Rating    int            `json:"rating" gorm:"not null"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Images    string         `json:"images" gorm:"type:text"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Announcement struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"size:200;not null"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Status    int            `json:"status" gorm:"default:1"`
	Sort      int            `json:"sort" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type News struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"size:200;not null"`
	Cover     string         `json:"cover" gorm:"size:500"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Views     int            `json:"views" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Forum struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	User      *User          `json:"user" gorm:"-"`
	Title     string         `json:"title" gorm:"size:200;not null"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Images    string         `json:"images" gorm:"type:text"`
	Views     int            `json:"views" gorm:"default:0"`
	Likes     int            `json:"likes" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type ForumReply struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	ForumID   uint           `json:"forum_id" gorm:"not null;index"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	User      *User          `json:"user" gorm:"-"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Likes     int            `json:"likes" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Carousel struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"size:200"`
	Image     string         `json:"image" gorm:"size:500;not null"`
	Link      string         `json:"link" gorm:"size:500"`
	Sort      int            `json:"sort" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type Recharge struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	Amount    float64        `json:"amount" gorm:"type:decimal(10,2);not null"`
	Status    int            `json:"status" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}
