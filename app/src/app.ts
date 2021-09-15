import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createConnection } from "typeorm";


createConnection().then(db => {

    const app = express();
    
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(cors({
        origin:['http://localhost:3000','http://localhost:8080','http://localhost:4200']
    }));
    
    const PORT:number = 8000;
    app.listen(PORT, () => {
        console.log("Database Connected Successfully");
        console.log(`App is listening on ${PORT}`);
    })

}).catch(err => {
    console.log(err);
    process.exit(0);    
})

