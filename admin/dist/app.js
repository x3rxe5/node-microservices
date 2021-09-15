"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const product_1 = require("./entity/product");
const morgan_1 = __importDefault(require("morgan"));
const amqp = __importStar(require("amqplib/callback_api"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: process.cwd() + "/src/config.env" });
typeorm_1.createConnection().then(db => {
    const productRepository = db.getRepository(product_1.Product);
    amqp.connect(process.env.RABBIT_MQ_ID, (error, connection) => {
        if (error) {
            console.log(error);
        }
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }
            /* ++++++++++++++++++++++++++ main event will start from here ++++++++++++++++++++++++++++++++++++ */
            // INSIDE THE RABBIT CLASS AND RUN
            const app = express_1.default();
            app.use(morgan_1.default("dev"));
            app.use(express_1.default.json());
            app.use(cors_1.default({
                origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8000']
            }));
            // API ENDPOINTS
            app.get("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const products = yield productRepository.find();
                    res.status(200).json({
                        status: "SUCCESS",
                        products
                    });
                }
                catch (err) {
                    res.status(400).json({
                        status: "FAILED",
                        err
                    });
                }
            }));
            app.post("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    console.log(req.body);
                    const products = yield productRepository.create(req.body);
                    const result = yield productRepository.save(products);
                    res.status(200).json({
                        status: "SUCCESS",
                        result
                    });
                }
                catch (err) {
                    res.status(400).json({
                        status: "FAILED",
                        err
                    });
                }
            }));
            app.get("/api/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const product = yield productRepository.findOne(req.params.id);
                    res.status(200).json({
                        status: "SUCCESS",
                        product
                    });
                }
                catch (err) {
                    res.status(400).json({
                        status: "FAILED",
                        err
                    });
                }
            }));
            app.put("/api/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const products = yield productRepository.findOne(req.params.id);
                    productRepository.merge(products, req.body);
                    const result = yield productRepository.save(products);
                    res.status(200).json({
                        status: "SUCCESS",
                        result
                    });
                }
                catch (err) {
                    res.status(400).json({
                        status: "FAILED",
                        err
                    });
                }
            }));
            app.delete("/api/products/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const products = yield productRepository.delete(req.params.id);
                    res.status(200).json({
                        status: "SUCCESS",
                        products
                    });
                }
                catch (err) {
                    res.status(400).json({
                        status: "FAILED",
                        err
                    });
                }
            }));
            app.post("/api/products/:id/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const products = yield productRepository.findOne(req.params.id);
                    products.likes++;
                    const result = yield productRepository.save(products);
                    res.status(200).json({
                        status: "SUCCESS",
                        result
                    });
                }
                catch (err) {
                    res.status(400).json({
                        status: "FAILED",
                        err
                    });
                }
            }));
            const PORT = 5000;
            app.listen(PORT, () => {
                console.log(`DB connection Successful `);
                console.log(`App is listening on PORT ${PORT}`);
            });
            // THE END IS HERE
        });
    });
});
//# sourceMappingURL=app.js.map