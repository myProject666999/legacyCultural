package main

import (
	"fmt"
	"legacyCultural/config"
	"legacyCultural/routes"
	"legacyCultural/utils"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		fmt.Println("Failed to load config:", err)
		return
	}

	utils.InitJWTSecret(config.AppConfig.JWTSecret)

	if err := config.InitDB(); err != nil {
		fmt.Println("Failed to initialize database:", err)
		return
	}

	r := routes.SetupRouter()

	addr := fmt.Sprintf(":%d", config.AppConfig.Port)
	fmt.Printf("Server starting on %s\n", addr)
	if err := r.Run(addr); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
