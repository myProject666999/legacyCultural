package controllers

import (
	"legacyCultural/config"
	"legacyCultural/models"
	"legacyCultural/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func UserRegister(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var existing models.User
	if config.DB.Where("username = ?", req.Username).First(&existing).RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名已存在"))
		return
	}

	user := &models.User{
		Username: req.Username,
		Password: utils.HashPassword(req.Password),
		Email:    req.Email,
		Phone:    req.Phone,
	}

	if err := config.DB.Create(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "注册失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("注册成功", nil))
}

func UserLogin(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var user models.User
	if err := config.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名或密码错误"))
		return
	}

	if user.Status != 1 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "账户已被禁用"))
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名或密码错误"))
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, false, "user")
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "生成token失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"token": token,
		"user":  user,
	}))
}

func GetUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(user))
}

func UpdateUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Email  string `json:"email"`
		Phone  string `json:"phone"`
		Avatar string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func UpdateUserPassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户不存在"))
		return
	}

	if !utils.CheckPassword(req.OldPassword, user.Password) {
		c.JSON(http.StatusBadRequest, utils.Error(400, "原密码错误"))
		return
	}

	if err := config.DB.Model(&user).Update("password", utils.HashPassword(req.NewPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "修改失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("密码修改成功", nil))
}

func Recharge(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Amount float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "充值金额必须大于0"))
		return
	}

	tx := config.DB.Begin()

	if err := tx.Model(&models.User{}).Where("id = ?", userID).UpdateColumn("balance", config.DB.Raw("balance + ?", req.Amount)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "充值失败"))
		return
	}

	recharge := &models.Recharge{
		UserID: userID,
		Amount: req.Amount,
		Status: 1,
	}
	if err := tx.Create(recharge).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, utils.Error(500, "充值失败"))
		return
	}

	tx.Commit()

	var user models.User
	config.DB.First(&user, userID)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"message": "充值成功",
		"balance": user.Balance,
	}))
}

func GetUserList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	var total int64
	query := config.DB.Model(&models.User{})

	if keyword != "" {
		query = query.Where("username LIKE ? OR email LIKE ? OR phone LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	var users []models.User
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users)

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func UpdateUserStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}
