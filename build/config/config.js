"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1'; //127.0.0.1
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'creditapp';
const MYSQL_USER = process.env.MYSQL_HOST || 'root'; //'loansystem_root'
const MYSQL_PASS = process.env.MYSQL_HOST || 'root_php'; //'2b*qD21z7'
const MYSQL = {
    host: MYSQL_HOST,
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    pass: MYSQL_PASS
};
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 1402; //8080
const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT
};
const AWS_ID = process.env.AWS_ID || 'AKIA4UJZ7TJYTMTOL35N';
const AWS_SECRET = process.env.AWS_SECRET || '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';
// const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'localhost';
const S3BUCKET = {
    aws_Id: AWS_ID,
    aws_secret: AWS_SECRET
};
const BASEREQUST = [
    '/api/roles/getAllRoles',
    '/api/roles/insertRoles',
    '/api/roles/updateRoles',
    '/api/roles/deleteRole',
    '/api/partner/users/login',
    '/api/customer/users/clientVerifyContact',
    '/api/customer/users/checkContactNoExist',
    '/api/admin/users/login',
    '/api/customer/cities/getCityByPincode'
];
const config = {
    mysql: MYSQL,
    s3bucket: S3BUCKET,
    baseRequests: BASEREQUST,
    server: SERVER
};
exports.default = config;
