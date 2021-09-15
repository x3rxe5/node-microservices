import express,{ Request,Response } from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import { Product } from "./entity/product";
import morgan from "morgan";
import * as amqp from "amqplib/callback_api";
import dotenv from "dotenv";


dotenv.config({ path: process.cwd() + "/src/config.env"});

createConnection().then(db => {

    const productRepository = db.getRepository(Product);

    amqp.connect(process.env.RABBIT_MQ_ID,(error,connection) => {
        if(error){
            console.log(error);
        }
        connection.createChannel( (err,channel) => {
            if(err){
                throw err;
            }
/* ++++++++++++++++++++++++++ main event will start from here ++++++++++++++++++++++++++++++++++++ */
            // INSIDE THE RABBIT CLASS AND RUN
            const app = express();

            app.use(morgan("dev"));
            app.use(express.json());
            app.use(cors({
                origin:['http://localhost:3000','http://localhost:5000','http://localhost:8000']
            }));
        
            // API ENDPOINTS
            app.get("/api/products", async (req:Request,res:Response) => {
                try{
                    const products = await productRepository.find();
                    res.status(200).json({
                        status:"SUCCESS",
                        products
                    })
                }catch(err){
                    res.status(400).json({
                        status:"FAILED",
                        err
                    })
                }
            });
        
            app.post("/api/products", async (req:Request,res:Response) => {
                try{
                    console.log(req.body);
                    const products = await productRepository.create(req.body);
                    const result = await productRepository.save(products);
                    res.status(200).json({
                        status:"SUCCESS",
                        result
                    })
                }catch(err){
                    res.status(400).json({
                        status:"FAILED",
                        err
                    })
                }
            });
        
            app.get("/api/products/:id", async (req:Request,res:Response) => {
                try{
                    const product = await productRepository.findOne(req.params.id);         
                    res.status(200).json({
                        status:"SUCCESS",
                        product
                    })
                }catch(err){
                    res.status(400).json({
                        status:"FAILED",
                        err
                    })
                }
        
            });
        
            app.put("/api/products/:id", async (req:Request,res:Response) => {
                try{
                 
                    const products = await productRepository.findOne(req.params.id);
                    productRepository.merge(products,req.body);
                    const result = await productRepository.save(products);
                    res.status(200).json({
                        status:"SUCCESS",
                        result
                    })
                }catch(err){
                    res.status(400).json({
                        status:"FAILED",
                        err
                    })
                }
            });
        
        
            app.delete("/api/products/:id", async (req:Request,res:Response) => {
                try{         
                    const products = await productRepository.delete(req.params.id);            
                    res.status(200).json({
                        status:"SUCCESS",
                        products
                    })
                }catch(err){
                    res.status(400).json({
                        status:"FAILED",
                        err
                    })
                }
            });
        
            app.post("/api/products/:id/like", async (req:Request,res:Response) => {
                try{         
                    const products = await productRepository.findOne(req.params.id);            
                    products.likes++;
                    const result = await productRepository.save(products);
                    res.status(200).json({
                        status:"SUCCESS",
                        result
                    })
                }catch(err){
                    res.status(400).json({
                        status:"FAILED",
                        err
                    })
                }
            })
            
        
            const PORT:number = 5000;
        
            app.listen(PORT, () => {
                console.log(`DB connection Successful `);
                console.log(`App is listening on PORT ${PORT}`);
            });
            // THE END IS HERE
        })
    })
})
