CREATE TABLE `user` (
`userId` int NOT NULL AUTO_INCREMENT,
`username` varchar(255) NOT NULL,
`email` varchar(255) UNIQUE NOT NULL,
`phone` varchar(30) UNIQUE NOT NULL,
`password` varchar(255) NOT NULL,
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`userId`)
);

CREATE TABLE `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` varchar(255) NOT NULL,
  `groceryId` int NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `totalPrice` decimal(10,2) NOT NULL,
  `ordered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `delivered_at` timestamp NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_order_grocery` FOREIGN KEY (`groceryId`)  REFERENCES `grocery_inventory` (`groceryId`)
);

CREATE TABLE `user_order_mapping` (
`id` int NOT NULL AUTO_INCREMENT,
`userId` int NOT NULL,
`orderId` varchar(255) NOT NULL,
`orderTotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
CONSTRAINT `FK_usermapping` FOREIGN KEY (`userId`)  REFERENCES  `user` (`userId`)
);

CREATE TABLE `grocery_inventory` (
  `groceryId` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `name` varchar(255) UNIQUE NOT NULL,
  `category_name` varchar(255) NULL,
  `unitprice` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`groceryId`)
);



 
