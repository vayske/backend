use std::fs::File;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use actix_multipart::{Multipart, form};
use futures_util::TryStreamExt;
use mime::{ Mime, IMAGE_PNG, IMAGE_JPEG, IMAGE_GIF, IMAGE_BMP };
use tokio::{
    fs,
    io::AsyncWriteExt
};

#[get("/get")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/upload")]
async fn save_files(mut payload: Multipart) -> impl Responder {
    println!("called!");
    let legal_filetypes: [Mime; 4] = [IMAGE_BMP, IMAGE_GIF, IMAGE_JPEG, IMAGE_PNG];
    let dir: &str = "./images/";
    loop {
        if let Ok(Some(mut field)) = payload.try_next().await {
            let filetype: Option<&Mime> = field.content_type();
            if filetype.is_none() {
                continue;
            }
            if !legal_filetypes.contains(&filetype.unwrap()) {
                continue;
            }
            let destination: String = format!("{}{}", dir, field.content_disposition().get_filename().unwrap());
            let mut save_image: fs::File = fs::File::create(&destination).await.unwrap();
            while let Ok(Some(chunk)) = field.try_next().await {
                save_image.write_all(&chunk).await.unwrap();
            }
        } else {
            break;
        }
    }
    HttpResponse::Ok().body("Hey there!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(save_files)
            .route("/hey", web::get().to(manual_hello))
    })
    .bind(("192.168.1.10", 8080))?
    .run()
    .await
}
