package controllers

import (
	"legacyCultural/config"
	"legacyCultural/models"
	"legacyCultural/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AdminLogin(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var admin models.Admin
	if err := config.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名或密码错误"))
		return
	}

	if admin.Status != 1 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "账户已被禁用"))
		return
	}

	if !utils.CheckPassword(req.Password, admin.Password) {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名或密码错误"))
		return
	}

	token, err := utils.GenerateToken(admin.ID, admin.Username, true, admin.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "生成token失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"token": token,
		"admin": admin,
	}))
}

func GetAdminInfo(c *gin.Context) {
	adminID := c.GetUint("user_id")

	var admin models.Admin
	if err := config.DB.First(&admin, adminID).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "管理员不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(admin))
}

func GetAdminList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	config.DB.Model(&models.Admin{}).Count(&total)

	var admins []models.Admin
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&admins)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      admins,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateAdmin(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var existing models.Admin
	if config.DB.Where("username = ?", req.Username).First(&existing).RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名已存在"))
		return
	}

	role := req.Role
	if role == "" {
		role = "admin"
	}

	admin := &models.Admin{
		Username: req.Username,
		Password: utils.HashPassword(req.Password),
		Role:     role,
		Status:   1,
	}

	if err := config.DB.Create(admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", admin))
}

func UpdateAdmin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Role     string `json:"role"`
		Status   *int   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var admin models.Admin
	if err := config.DB.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "管理员不存在"))
		return
	}

	updates := make(map[string]interface{})
	if req.Username != "" {
		updates["username"] = req.Username
	}
	if req.Password != "" {
		updates["password"] = utils.HashPassword(req.Password)
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}
	if req.Status != nil {
		updates["status"] = req.Status
	}

	if err := config.DB.Model(&admin).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteAdmin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if id == 1 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "超级管理员不可删除"))
		return
	}

	if err := config.DB.Delete(&models.Admin{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}
