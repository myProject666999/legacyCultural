package controllers

import (
	"legacyCultural/config"
	"legacyCultural/models"
	"legacyCultural/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetForumList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	var total int64
	query := config.DB.Model(&models.Forum{}).Where("status = 1 AND deleted_at IS NULL")

	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	var forums []models.Forum
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&forums)

	for i := range forums {
		var user models.User
		config.DB.Select("id, username, avatar").Where("id = ?", forums[i].UserID).First(&user)
		forums[i].User = &user
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      forums,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetForumDetail(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var forum models.Forum
	if err := config.DB.Where("id = ? AND status = 1 AND deleted_at IS NULL", id).First(&forum).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "帖子不存在"))
		return
	}

	var user models.User
	config.DB.Select("id, username, avatar").Where("id = ?", forum.UserID).First(&user)
	forum.User = &user

	config.DB.Model(&forum).UpdateColumn("views", forum.Views+1)

	var replies []models.ForumReply
	config.DB.Where("forum_id = ? AND deleted_at IS NULL", forum.ID).Order("created_at ASC").Find(&replies)
	for i := range replies {
		var replyUser models.User
		config.DB.Select("id, username, avatar").Where("id = ?", replies[i].UserID).First(&replyUser)
		replies[i].User = &replyUser
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"forum":   forum,
		"replies": replies,
	}))
}

func CreateForum(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Images  string `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	forum := &models.Forum{
		UserID:  userID,
		Title:   req.Title,
		Content: req.Content,
		Images:  req.Images,
		Status:  1,
	}

	if err := config.DB.Create(forum).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "发布失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("发布成功", forum))
}

func CreateForumReply(c *gin.Context) {
	userID := c.GetUint("user_id")
	forumID, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	reply := &models.ForumReply{
		ForumID: uint(forumID),
		UserID:  userID,
		Content: req.Content,
	}

	if err := config.DB.Create(reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "回复失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("回复成功", reply))
}

func GetAllForums(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	var total int64
	query := config.DB.Model(&models.Forum{}).Where("deleted_at IS NULL")

	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)

	var forums []models.Forum
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&forums)

	for i := range forums {
		var user models.User
		config.DB.Select("id, username, avatar").Where("id = ?", forums[i].UserID).First(&user)
		forums[i].User = &user
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      forums,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func UpdateForumStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Model(&models.Forum{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteForum(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.Forum{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	config.DB.Where("forum_id = ?", id).Delete(&models.ForumReply{})

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func DeleteForumReply(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.ForumReply{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetCarouselList(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Where("status = 1").Order("sort ASC").Find(&carousels)

	c.JSON(http.StatusOK, utils.Success(carousels))
}

func GetAllCarousels(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Order("sort ASC, created_at DESC").Find(&carousels)

	c.JSON(http.StatusOK, utils.Success(carousels))
}

func CreateCarousel(c *gin.Context) {
	var req struct {
		Title  string `json:"title"`
		Image  string `json:"image" binding:"required"`
		Link   string `json:"link"`
		Sort   int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	carousel := &models.Carousel{
		Title:  req.Title,
		Image:  req.Image,
		Link:   req.Link,
		Sort:   req.Sort,
		Status: 1,
	}

	if err := config.DB.Create(carousel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", carousel))
}

func UpdateCarousel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Title  string `json:"title"`
		Image  string `json:"image"`
		Link   string `json:"link"`
		Sort   int    `json:"sort"`
		Status *int   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	if req.Link != "" {
		updates["link"] = req.Link
	}
	if req.Sort != 0 {
		updates["sort"] = req.Sort
	}
	if req.Status != nil {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&models.Carousel{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteCarousel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.Carousel{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetStatistics(c *gin.Context) {
	var userCount int64
	config.DB.Model(&models.User{}).Count(&userCount)

	var orderCount int64
	config.DB.Model(&models.Order{}).Where("deleted_at IS NULL").Count(&orderCount)

	var totalSales float64
	config.DB.Model(&models.Order{}).Where("status >= 1 AND deleted_at IS NULL").Select("COALESCE(SUM(total_price), 0)").Scan(&totalSales)

	var productCount int64
	config.DB.Model(&models.Product{}).Where("deleted_at IS NULL").Count(&productCount)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"user_count":    userCount,
		"order_count":   orderCount,
		"total_sales":   totalSales,
		"product_count": productCount,
	}))
}

func GetSalesStatistics(c *gin.Context) {
	type DailySales struct {
		Date  string  `json:"date"`
		Total float64 `json:"total"`
	}

	var sales []DailySales
	config.DB.Model(&models.Order{}).
		Where("status >= 1 AND deleted_at IS NULL").
		Select("DATE(created_at) as date, COALESCE(SUM(total_price), 0) as total").
		Group("DATE(created_at)").
		Order("date DESC").
		Limit(30).
		Scan(&sales)

	c.JSON(http.StatusOK, utils.Success(sales))
}
