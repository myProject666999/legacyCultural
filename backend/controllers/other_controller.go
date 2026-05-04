package controllers

import (
	"legacyCultural/config"
	"legacyCultural/models"
	"legacyCultural/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetFavoriteList(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	config.DB.Model(&models.Favorite{}).Where("user_id = ?", userID).Count(&total)

	var favorites []models.Favorite
	offset := (page - 1) * pageSize
	config.DB.Where("user_id = ?", userID).Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&favorites)

	for i := range favorites {
		var product models.Product
		config.DB.Where("id = ?", favorites[i].ProductID).First(&product)
		favorites[i].Product = &product
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      favorites,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		ProductID uint `json:"product_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var existing models.Favorite
	if config.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existing).RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "已收藏"))
		return
	}

	favorite := &models.Favorite{
		UserID:    userID,
		ProductID: req.ProductID,
	}

	if err := config.DB.Create(favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "收藏失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("收藏成功", nil))
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Favorite{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "取消收藏失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("取消收藏成功", nil))
}

func GetReviewList(c *gin.Context) {
	productID := c.Query("product_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	query := config.DB.Model(&models.Review{}).Where("deleted_at IS NULL")

	if productID != "" {
		query = query.Where("product_id = ?", productID)
	}

	query.Count(&total)

	var reviews []models.Review
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&reviews)

	for i := range reviews {
		var user models.User
		config.DB.Select("id, username, avatar").Where("id = ?", reviews[i].UserID).First(&user)
		reviews[i].User = &user
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      reviews,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateReview(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		ProductID uint   `json:"product_id" binding:"required"`
		OrderID   uint   `json:"order_id"`
		Rating    int    `json:"rating" binding:"required"`
		Content   string `json:"content" binding:"required"`
		Images    string `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	review := &models.Review{
		UserID:    userID,
		ProductID: req.ProductID,
		OrderID:   req.OrderID,
		Rating:    req.Rating,
		Content:   req.Content,
		Images:    req.Images,
	}

	if err := config.DB.Create(review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "评价失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("评价成功", review))
}

func DeleteReview(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.Review{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetAnnouncementList(c *gin.Context) {
	var announcements []models.Announcement
	config.DB.Where("status = 1").Order("sort ASC, created_at DESC").Find(&announcements)

	c.JSON(http.StatusOK, utils.Success(announcements))
}

func GetAllAnnouncements(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	config.DB.Model(&models.Announcement{}).Count(&total)

	var announcements []models.Announcement
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("sort ASC, created_at DESC").Find(&announcements)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      announcements,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateAnnouncement(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Sort    int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	announcement := &models.Announcement{
		Title:   req.Title,
		Content: req.Content,
		Sort:    req.Sort,
		Status:  1,
	}

	if err := config.DB.Create(announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", announcement))
}

func UpdateAnnouncement(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
		Sort    int    `json:"sort"`
		Status  *int   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Sort != 0 {
		updates["sort"] = req.Sort
	}
	if req.Status != nil {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&models.Announcement{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteAnnouncement(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.Announcement{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetNewsList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	config.DB.Model(&models.News{}).Where("status = 1 AND deleted_at IS NULL").Count(&total)

	var news []models.News
	offset := (page - 1) * pageSize
	config.DB.Where("status = 1 AND deleted_at IS NULL").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&news)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      news,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetNewsDetail(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var news models.News
	if err := config.DB.Where("id = ? AND status = 1 AND deleted_at IS NULL", id).First(&news).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "新闻不存在"))
		return
	}

	config.DB.Model(&news).UpdateColumn("views", news.Views+1)

	c.JSON(http.StatusOK, utils.Success(news))
}

func GetAllNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	var total int64
	query := config.DB.Model(&models.News{}).Where("deleted_at IS NULL")

	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)

	var news []models.News
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&news)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      news,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateNews(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required"`
		Cover   string `json:"cover"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	news := &models.News{
		Title:   req.Title,
		Cover:   req.Cover,
		Content: req.Content,
		Status:  1,
	}

	if err := config.DB.Create(news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", news))
}

func UpdateNews(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Title   string `json:"title"`
		Cover   string `json:"cover"`
		Content string `json:"content"`
		Status  *int   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Cover != "" {
		updates["cover"] = req.Cover
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Status != nil {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&models.News{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteNews(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.News{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}
