package controllers

import (
	"legacyCultural/config"
	"legacyCultural/models"
	"legacyCultural/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetProductTypeList(c *gin.Context) {
	parentID, _ := strconv.Atoi(c.DefaultQuery("parent_id", "0"))

	var types []models.ProductType
	config.DB.Where("parent_id = ? AND status = 1", parentID).Order("sort ASC").Find(&types)

	c.JSON(http.StatusOK, utils.Success(types))
}

func GetAllProductTypes(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "100"))

	var total int64
	config.DB.Model(&models.ProductType{}).Count(&total)

	var types []models.ProductType
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("parent_id ASC, sort ASC").Find(&types)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      types,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateProductType(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		ParentID uint   `json:"parent_id"`
		Sort     int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	productType := &models.ProductType{
		Name:     req.Name,
		ParentID: req.ParentID,
		Sort:     req.Sort,
		Status:   1,
	}

	if err := config.DB.Create(productType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", productType))
}

func UpdateProductType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Name     string `json:"name"`
		ParentID uint   `json:"parent_id"`
		Sort     int    `json:"sort"`
		Status   *int   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.ParentID != 0 {
		updates["parent_id"] = req.ParentID
	}
	if req.Sort != 0 {
		updates["sort"] = req.Sort
	}
	if req.Status != nil {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&models.ProductType{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteProductType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.ProductType{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetProductList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	typeID := c.Query("type_id")
	keyword := c.Query("keyword")
	status := c.Query("status")

	var total int64
	query := config.DB.Model(&models.Product{}).Where("deleted_at IS NULL")

	if typeID != "" {
		query = query.Where("type_id = ?", typeID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	var products []models.Product
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&products)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      products,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetProductDetail(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var product models.Product
	if err := config.DB.Where("id = ? AND deleted_at IS NULL", id).First(&product).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "商品不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(product))
}

func CreateProduct(c *gin.Context) {
	var req struct {
		TypeID      uint    `json:"type_id" binding:"required"`
		Name        string  `json:"name" binding:"required"`
		Description string  `json:"description"`
		Image       string  `json:"image"`
		Images      string  `json:"images"`
		Price       float64 `json:"price" binding:"required"`
		Stock       int     `json:"stock"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	product := &models.Product{
		TypeID:      req.TypeID,
		Name:        req.Name,
		Description: req.Description,
		Image:       req.Image,
		Images:      req.Images,
		Price:       req.Price,
		Stock:       req.Stock,
		Status:      1,
	}

	if err := config.DB.Create(product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", product))
}

func UpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		TypeID      uint    `json:"type_id"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Image       string  `json:"image"`
		Images      string  `json:"images"`
		Price       float64 `json:"price"`
		Stock       int     `json:"stock"`
		Status      *int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if req.TypeID != 0 {
		updates["type_id"] = req.TypeID
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	if req.Images != "" {
		updates["images"] = req.Images
	}
	if req.Price != 0 {
		updates["price"] = req.Price
	}
	if req.Stock != 0 {
		updates["stock"] = req.Stock
	}
	if req.Status != nil {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&models.Product{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}
