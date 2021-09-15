"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
typeorm_1.createConnection().then(db => {
    const app = express_1.default();
    app.use(morgan_1.default("dev"));
    app.use(express_1.default.json());
    app.use(cors_1.default({
        origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200']
    }));
    const PORT = 8000;
    app.listen(PORT, () => {
        console.log("Database Connected Successfully");
        console.log(`App is listening on ${PORT}`);
    });
}).catch(err => {
    console.log(err);
    process.exit(0);
});
//# sourceMappingURL=app.js.map