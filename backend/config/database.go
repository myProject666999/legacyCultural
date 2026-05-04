package config

import (
	"fmt"
	"legacyCultural/models"
	"legacyCultural/utils"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		AppConfig.DBUser,
		AppConfig.DBPass,
		AppConfig.DBHost,
		AppConfig.DBPort,
		AppConfig.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return err
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.Admin{},
		&models.ProductType{},
		&models.Product{},
		&models.Address{},
		&models.Order{},
		&models.OrderItem{},
		&models.Favorite{},
		&models.Review{},
		&models.Announcement{},
		&models.News{},
		&models.Forum{},
		&models.ForumReply{},
		&models.Carousel{},
		&models.Recharge{},
	)

	if err != nil {
		return err
	}

	createDefaultAdmin()

	return nil
}

func createDefaultAdmin() {
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		admin := &models.Admin{
			Username: "admin",
			Password: utils.HashPassword("admin123"),
			Role:     "super",
		}
		DB.Create(admin)
		fmt.Println("Default admin created: admin / admin123")
	}
}
