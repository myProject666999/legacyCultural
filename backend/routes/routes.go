package routes

import (
	"legacyCultural/controllers"
	"legacyCultural/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middlewares.CORSMiddleware())

	api := r.Group("/api")
	{
		user := api.Group("/user")
		{
			user.POST("/register", controllers.UserRegister)
			user.POST("/login", controllers.UserLogin)
			user.GET("/info", middlewares.AuthMiddleware(), controllers.GetUserInfo)
			user.PUT("/info", middlewares.AuthMiddleware(), controllers.UpdateUserInfo)
			user.PUT("/password", middlewares.AuthMiddleware(), controllers.UpdateUserPassword)
			user.POST("/recharge", middlewares.AuthMiddleware(), controllers.Recharge)
		}

		address := api.Group("/address")
		address.Use(middlewares.AuthMiddleware())
		{
			address.GET("", controllers.GetAddressList)
			address.POST("", controllers.CreateAddress)
			address.PUT("/:id", controllers.UpdateAddress)
			address.DELETE("/:id", controllers.DeleteAddress)
		}

		productType := api.Group("/product-type")
		{
			productType.GET("", controllers.GetProductTypeList)
		}

		product := api.Group("/product")
		{
			product.GET("", controllers.GetProductList)
			product.GET("/:id", controllers.GetProductDetail)
		}

		order := api.Group("/order")
		order.Use(middlewares.AuthMiddleware())
		{
			order.GET("", controllers.GetOrderList)
			order.GET("/:id", controllers.GetOrderDetail)
			order.POST("", controllers.CreateOrder)
			order.PUT("/:id/status", controllers.UpdateOrderStatus)
		}

		favorite := api.Group("/favorite")
		favorite.Use(middlewares.AuthMiddleware())
		{
			favorite.GET("", controllers.GetFavoriteList)
			favorite.POST("", controllers.AddFavorite)
			favorite.DELETE("/:id", controllers.RemoveFavorite)
		}

		review := api.Group("/review")
		{
			review.GET("", controllers.GetReviewList)
			review.POST("", middlewares.AuthMiddleware(), controllers.CreateReview)
		}

		announcement := api.Group("/announcement")
		{
			announcement.GET("", controllers.GetAnnouncementList)
		}

		news := api.Group("/news")
		{
			news.GET("", controllers.GetNewsList)
			news.GET("/:id", controllers.GetNewsDetail)
		}

		forum := api.Group("/forum")
		{
			forum.GET("", controllers.GetForumList)
			forum.GET("/:id", controllers.GetForumDetail)
			forum.POST("", middlewares.AuthMiddleware(), controllers.CreateForum)
			forum.POST("/:id/reply", middlewares.AuthMiddleware(), controllers.CreateForumReply)
		}

		carousel := api.Group("/carousel")
		{
			carousel.GET("", controllers.GetCarouselList)
		}

		admin := api.Group("/admin")
		{
			admin.POST("/login", controllers.AdminLogin)
			admin.GET("/info", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAdminInfo)

			admin.GET("/statistics", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetStatistics)
			admin.GET("/sales-statistics", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetSalesStatistics)

			admin.GET("/users", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetUserList)
			admin.PUT("/users/:id/status", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateUserStatus)

			admin.GET("/admins", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAdminList)
			admin.POST("/admins", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.CreateAdmin)
			admin.PUT("/admins/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateAdmin)
			admin.DELETE("/admins/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteAdmin)

			admin.GET("/product-types", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAllProductTypes)
			admin.POST("/product-types", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.CreateProductType)
			admin.PUT("/product-types/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateProductType)
			admin.DELETE("/product-types/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteProductType)

			admin.GET("/products", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetProductList)
			admin.POST("/products", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.CreateProduct)
			admin.PUT("/products/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateProduct)
			admin.DELETE("/products/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteProduct)

			admin.GET("/orders", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAdminOrderList)
			admin.PUT("/orders/:id/status", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.AdminUpdateOrderStatus)

			admin.GET("/announcements", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAllAnnouncements)
			admin.POST("/announcements", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.CreateAnnouncement)
			admin.PUT("/announcements/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateAnnouncement)
			admin.DELETE("/announcements/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteAnnouncement)

			admin.GET("/news", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAllNews)
			admin.POST("/news", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.CreateNews)
			admin.PUT("/news/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateNews)
			admin.DELETE("/news/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteNews)

			admin.GET("/forums", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAllForums)
			admin.PUT("/forums/:id/status", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateForumStatus)
			admin.DELETE("/forums/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteForum)
			admin.DELETE("/forum-replies/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteForumReply)

			admin.GET("/carousels", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAllCarousels)
			admin.POST("/carousels", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.CreateCarousel)
			admin.PUT("/carousels/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.UpdateCarousel)
			admin.DELETE("/carousels/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteCarousel)

			admin.GET("/reviews", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetReviewList)
			admin.DELETE("/reviews/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteReview)
		}
	}

	return r
}
