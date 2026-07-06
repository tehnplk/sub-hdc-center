/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MariaDB
 Source Server Version : 101006
 Source Host           : localhost:3306
 Source Schema         : telemedicine

 Target Server Type    : MariaDB
 Target Server Version : 101006
 File Encoding         : 65001

 Date: 06/07/2026 12:18:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for hostype
-- ----------------------------
DROP TABLE IF EXISTS `hostype`;
CREATE TABLE `hostype`  (
  `hostype_new` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `hostype_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `dep_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `hostype` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `hostype_list` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`hostype_new`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of hostype
-- ----------------------------
INSERT INTO `hostype` VALUES ('11', 'กระทรวงสาธารณสุข', 'กรมสุขภาพจิต', 'รพ.จิตเวช', 'รายโรงพยาบาล');
INSERT INTO `hostype` VALUES ('12', 'สังกัดอื่น', NULL, 'รพ.นอกสังกัด', 'รายโรงพยาบาล');
INSERT INTO `hostype` VALUES ('13', 'สังกัดอื่น', 'กระทรวงยุติธรรม', 'สถานพยาบาล', 'รายหน่วยบริการ');
INSERT INTO `hostype` VALUES ('18', 'กระทรวงสาธารณสุข', 'สำนักปลัดกระทรวงสาธารณสุข', 'รพ.สต.', 'รายหน่วยบริการ');
INSERT INTO `hostype` VALUES ('21', 'องค์กรปกครองส่วนท้องถิ่น', 'องค์กรปกครองส่วนท้องถิ่น', 'รพ.สต.', 'รายหน่วยบริการ');
INSERT INTO `hostype` VALUES ('5', 'กระทรวงสาธารณสุข', 'สำนักปลัดกระทรวงสาธารณสุข', 'รพศ.', 'รายโรงพยาบาล');
INSERT INTO `hostype` VALUES ('7', 'กระทรวงสาธารณสุข', 'สำนักปลัดกระทรวงสาธารณสุข', 'รพ.', 'รายโรงพยาบาล');
INSERT INTO `hostype` VALUES ('8', 'กระทรวงสาธารณสุข', 'สำนักปลัดกระทรวงสาธารณสุข', 'ศูนย์สุขภาพ', 'รายหน่วยบริการ');

SET FOREIGN_KEY_CHECKS = 1;
