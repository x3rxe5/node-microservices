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
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const amqp = __importStar(require("amqplib/callback_api"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_1 = require("./entity/product");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config({ path: process.cwd() + "/src/config.env" });
typeorm_1.createConnection().then(db => {
    const productRepository = db.getMongoRepository(product_1.Product);
    amqp.connect(process.env.RABBIT_MQ_ID, (error, connection) => {
        if (error) {
            console.log(error);
        }
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }
            // Message from channel
            channel.assertQueue('product_created', { durable: false });
            channel.assertQueue('product_updated', { durable: false });
            channel.assertQueue('product_deleted', { durable: false });
            const app = express_1.default();
            app.use(morgan_1.default("dev"));
            app.use(express_1.default.json());
            app.use(cors_1.default({
                origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
            }));
            // Channel Event
            channel.consume('product_created', (message) => __awaiter(void 0, void 0, void 0, function* () {
                const eventProduct = JSON.parse(message.content.toString());
                const product = new product_1.Product();
                product.admin_id = parseInt(eventProduct.id);
                product.image = eventProduct.image;
                product.likes = eventProduct.likes;
                product.title = eventProduct.title;
                yield productRepository.save(product);
                console.log("Product Created");
            }), { noAck: true });
            channel.consume("product_updated", (message) => __awaiter(void 0, void 0, void 0, function* () {
                const eventProduct = JSON.parse(message.content.toString());
                const product = yield productRepository.findOne({ admin_id: parseInt(eventProduct.id) });
                productRepository.merge(product, {
                    title: eventProduct.title,
                    image: eventProduct.image,
                    likes: eventProduct.likes
                });
                yield productRepository.save(product);
                console.log("Product Updated");
            }), { noAck: true });
            channel.consume("product_deleted", (message) => __awaiter(void 0, void 0, void 0, function* () {
                const admin_id = parseInt(message.content.toString());
                yield productRepository.deleteOne({ admin_id });
                console.log("Product deleted");
            }), { noAck: true });
            // api endpoints
            app.get("/", (req, res) => {
                res.status(200).json({ status: "success" });
            });
            app.get("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                // try{
                const products = yield productRepository.find();
                res.status(200).json({
                    status: "SUCCESS",
                    products
                });
                // }catch(err){
                //     console.log(`error occured -> `,err);
                //     res.status(400).json({
                //         status:"FAILED",
                //         err
                //     })
                // }                
            }));
            app.post("/api/products/:id/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const product = yield productRepository.findOne(req.params.id);
                    yield axios_1.default.post(`http://localhost:5000/api/products/${product.admin_id}/like`, {});
                    product.likes++;
                    yield productRepository.save(product);
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
            const PORT = 8000;
            app.listen(PORT, () => {
                console.log("Database Connected Successfully");
                console.log(`App is listening on ${PORT}`);
            });
            process.on("beforeExit", () => {
                console.log("Closing");
                connection.close();
            });
        });
    });
}).catch(err => {
    console.log(err);
    process.exit(0);
});
//# sourceMappingURL=app.js.map