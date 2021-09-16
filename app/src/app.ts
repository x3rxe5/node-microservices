import express,{ Request,Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { createConnection } from "typeorm";
import * as amqp from "amqplib/callback_api";
import dotenv from "dotenv";
import { Product } from "./entity/product";
import axios from "axios";

dotenv.config({ path: process.cwd() + "/src/config.env"});



createConnection().then(db => {

    const productRepository = db.getMongoRepository(Product);

    amqp.connect(process.env.RABBIT_MQ_ID,(error,connection) => {
        if(error){
            console.log(error);
        }
        connection.createChannel( (err,channel) => {

            if(err){
                throw err;
            }

            // Message from channel

            channel.assertQueue('product_created',{ durable:false});
            channel.assertQueue('product_updated',{ durable:false});
            channel.assertQueue('product_deleted',{ durable:false});

            const app = express();

            app.use(morgan("dev"));
            app.use(express.json());
            app.use(cors({
                origin:['http://localhost:3000','http://localhost:8080','http://localhost:4200']
            }));
            
            // Channel Event
            channel.consume('product_created', async (message) => {
                const eventProduct:Product = JSON.parse(message.content.toString());
                const product = new Product();
                product.admin_id = parseInt(eventProduct.id);
                product.image = eventProduct.image;
                product.likes = eventProduct.likes;
                product.title = eventProduct.title;

                await productRepository.save(product);
                console.log("Product Created");
            },{ noAck:true });

            channel.consume("product_updated",async (message) => {
                const eventProduct:Product = JSON.parse(message.content.toString());
                const product = await productRepository.findOne({ admin_id:parseInt(eventProduct.id)});
                productRepository.merge(product,{
                    title:eventProduct.title,
                    image:eventProduct.image,
                    likes:eventProduct.likes
                });
                await productRepository.save(product);
                console.log("Product Updated");
            }, { noAck:true });

            channel.consume("product_deleted", async (message) => {
                const admin_id = parseInt(message.content.toString());
                await productRepository.deleteOne({ admin_id });
                console.log("Product deleted");
            },{ noAck:true });

            // api endpoints

            app.get("/",(req:Request,res:Response) => {
                res.status(200).json({ status:"success" });
            })

            app.get("/api/products", async (req:Request,res:Response) => {
                // try{
                    const products = await productRepository.find();
                    
                    res.status(200).json({
                        status:"SUCCESS",
                        products
                    })
                // }catch(err){
                //     console.log(`error occured -> `,err);
                //     res.status(400).json({
                //         status:"FAILED",
                //         err
                //     })
                // }                
            });

            app.post("/api/products/:id/like", async (req:Request,res:Response) => {
                try{
                    const product = await productRepository.findOne(req.params.id);
                    await axios.post(`http://localhost:5000/api/products/${product.admin_id}/like`,{});
                    product.likes++;
                    await productRepository.save(product);
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
            })

            const PORT:number = 8000;
            app.listen(PORT, () => {
                console.log("Database Connected Successfully");
                console.log(`App is listening on ${PORT}`);
            });

            process.on("beforeExit",() => {
                console.log("Closing");
                connection.close();
            })
        });
    });    
}).catch(err => {
    console.log(err);
    process.exit(0);    
})

