"use strict";
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
(0, typeorm_1.createConnection)().then(db => {
    const productRepository = db.getRepository(product_1.Product);
    const app = (0, express_1.default)();
    app.use((0, morgan_1.default)("dev"));
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
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
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`DB connection Successful `);
        console.log(`App is listening on PORT ${PORT}`);
    });
});
//# sourceMappingURL=app.js.map