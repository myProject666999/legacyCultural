package controllers

import (
	"encoding/json"
	"legacyCultural/config"
	"legacyCultural/models"
	"legacyCultural/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetAddressList(c *gin.Context) {
	userID := c.GetUint("user_id")

	var addresses []models.Address
	config.DB.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses)

	c.JSON(http.StatusOK, utils.Success(addresses))
}

func CreateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Name      string `json:"name" binding:"required"`
		Phone     string `json:"phone" binding:"required"`
		Province  string `json:"province"`
		City      string `json:"city"`
		District  string `json:"district"`
		Detail    string `json:"detail" binding:"required"`
		IsDefault int    `json:"is_default"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	tx := config.DB.Begin()

	if req.IsDefault == 1 {
		tx.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	address := &models.Address{
		UserID:    userID,
		Name:      req.Name,
		Phone:     req.Phone,
		Province:  req.Province,
		City:      req.City,
		District:  req.District,
		Detail:    req.Detail,
		IsDefault: req.IsDefault,
	}

	if err := tx.Create(address).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", address))
}

func UpdateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Name      string `json:"name"`
		Phone     string `json:"phone"`
		Province  string `json:"province"`
		City      string `json:"city"`
		District  string `json:"district"`
		Detail    string `json:"detail"`
		IsDefault *int   `json:"is_default"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var address models.Address
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&address).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "地址不存在"))
		return
	}

	tx := config.DB.Begin()

	if req.IsDefault != nil && *req.IsDefault == 1 {
		tx.Model(&models.Address{}).Where("user_id = ? AND id != ?", userID, id).Update("is_default", 0)
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Province != "" {
		updates["province"] = req.Province
	}
	if req.City != "" {
		updates["city"] = req.City
	}
	if req.District != "" {
		updates["district"] = req.District
	}
	if req.Detail != "" {
		updates["detail"] = req.Detail
	}
	if req.IsDefault != nil {
		updates["is_default"] = req.IsDefault
	}

	if err := tx.Model(&address).Updates(updates).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Address{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		AddressID uint                     `json:"address_id" binding:"required"`
		Items     []map[string]interface{} `json:"items" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if len(req.Items) == 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "商品列表为空"))
		return
	}

	var address models.Address
	if err := config.DB.Where("id = ? AND user_id = ?", req.AddressID, userID).First(&address).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "地址不存在"))
		return
	}

	addressJSON, _ := json.Marshal(address)

	tx := config.DB.Begin()

	orderNo := utils.GenerateOrderNo()
	var totalPrice float64

	for _, item := range req.Items {
		productID := uint(item["product_id"].(float64))
		quantity := int(item["quantity"].(float64))

		var product models.Product
		if err := tx.Where("id = ?", productID).First(&product).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, utils.Error(400, "商品不存在"))
			return
		}

		if product.Stock < quantity {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, utils.Error(400, "商品库存不足"))
			return
		}

		totalPrice += product.Price * float64(quantity)
	}

	var user models.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户不存在"))
		return
	}

	if user.Balance < totalPrice {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, utils.Error(400, "余额不足"))
		return
	}

	order := &models.Order{
		OrderNo:     orderNo,
		UserID:      userID,
		TotalPrice:  totalPrice,
		Status:      1,
		AddressID:   req.AddressID,
		AddressInfo: string(addressJSON),
	}

	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建订单失败"))
		return
	}

	for _, item := range req.Items {
		productID := uint(item["product_id"].(float64))
		quantity := int(item["quantity"].(float64))

		var product models.Product
		tx.Where("id = ?", productID).First(&product)

		orderItem := &models.OrderItem{
			OrderID:   order.ID,
			ProductID: productID,
			Quantity:  quantity,
			Price:     product.Price,
		}

		if err := tx.Create(orderItem).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, utils.Error(500, "创建订单失败"))
			return
		}

		if err := tx.Model(&product).Updates(map[string]interface{}{
			"stock": product.Stock - quantity,
			"sales": product.Sales + quantity,
		}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, utils.Error(500, "创建订单失败"))
			return
		}
	}

	if err := tx.Model(&user).UpdateColumn("balance", user.Balance-totalPrice).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建订单失败"))
		return
	}

	now := time.Now()
	order.PaymentTime = &now
	tx.Save(order)

	tx.Commit()

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"order_id": order.ID,
		"order_no": order.OrderNo,
	}))
}

func GetOrderList(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	query := config.DB.Model(&models.Order{}).Where("user_id = ? AND deleted_at IS NULL", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	var orders []models.Order
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders)

	for i := range orders {
		var items []models.OrderItem
		config.DB.Where("order_id = ?", orders[i].ID).Find(&items)
		for j := range items {
			var product models.Product
			config.DB.Select("id, name, image, price").Where("id = ?", items[j].ProductID).First(&product)
			items[j].Product = &product
		}
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      orders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetOrderDetail(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "订单不存在"))
		return
	}

	var items []models.OrderItem
	config.DB.Where("order_id = ?", order.ID).Find(&items)
	for j := range items {
		var product models.Product
		config.DB.Select("id, name, image, price").Where("id = ?", items[j].ProductID).First(&product)
		items[j].Product = &product
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"order": order,
		"items": items,
	}))
}

func UpdateOrderStatus(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ? AND deleted_at IS NULL", id, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "订单不存在"))
		return
	}

	if err := config.DB.Model(&order).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func GetAdminOrderList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	var total int64
	query := config.DB.Model(&models.Order{}).Where("deleted_at IS NULL")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("order_no LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)

	var orders []models.Order
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      orders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func AdminUpdateOrderStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Model(&models.Order{}).Where("id = ? AND deleted_at IS NULL", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}
