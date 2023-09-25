use actix_web::{get, post, App, web, HttpResponse, HttpServer, Responder};
use actix_multipart::Multipart;
use actix_files;
use futures_util::TryStreamExt;
use serde::Deserialize;

use mime::{ Mime, IMAGE_PNG, IMAGE_JPEG, IMAGE_GIF, IMAGE_BMP };
use tokio::{
    fs,
    io::AsyncWriteExt
};
use redis::{self, Commands};

#[derive(Deserialize)]
struct Info {
    tags: String,
}

#[get("/search")]
async fn search_files(info: web::Query<Info>) -> impl Responder {
    let result: Vec<String> = search_images(&info.tags);
    let mut response_text: String = "".to_owned();
    for s in result {
        response_text.push_str(&format!("{s} "));
    }
    HttpResponse::Ok().append_header(("Access-Control-Allow-Origin", "*")).body(response_text.trim_end().to_string())
}

#[post("/upload")]
async fn save_files(mut payload: Multipart) -> impl Responder {
    let legal_filetypes: [Mime; 4] = [IMAGE_BMP, IMAGE_GIF, IMAGE_JPEG, IMAGE_PNG];
    let dir: &str = "/images/";
    let mut response_body: String = "".to_owned();
    loop {
        if let Ok(Some(mut field)) = payload.try_next().await {
            let filetype: Option<&Mime> = field.content_type();
            if filetype.is_none() {
                continue;
            }
            if !legal_filetypes.contains(&filetype.unwrap()) {
                continue;
            }
            let filename: String = field.content_disposition().get_filename().unwrap().to_string();
            let tags: String = field.content_disposition().get_name().unwrap().to_string();
            response_body.push_str(&format!("file: {}\ttag: {:?}\n",filename,tags));
            let destination: String = format!("{}{}", dir, filename);
            let mut save_image: fs::File = fs::File::create(&destination).await.unwrap();
            println!("Upload: Writing {} to {}...", filename, destination);
            while let Ok(Some(chunk)) = field.try_next().await {
                save_image.write_all(&chunk).await.unwrap();
            }
            println!("Upload: Done!!");
            println!("Redis: Saving tags to db...");
            let _ = save_tags(&tags, &filename);
            println!("Redis: Done!!");
        } else {
            break;
        }
    }
    HttpResponse::Ok().append_header(("Access-Control-Allow-Origin", "*")).body(response_body)
}

fn save_tags(tags: &str, filename: &str) -> redis::RedisResult<()> {
    let mut connection = redis::Client::open("redis://redis:6379")
                                                        .expect("Invalid connection URL")
                                                        .get_connection()
                                                        .expect("failed to connect to Redis");
    let tag_list: Vec<&str> = tags.split_whitespace().collect();
    for tag in tag_list {
        let _ : () = redis::cmd("SADD").arg(tag).arg(filename).query(&mut connection)?;
    }
    Ok(())
}

fn search_images(tags: &str) -> Vec<String> {
    let mut connection = redis::Client::open("redis://redis:6379")
                                                        .expect("Invalid connection URL")
                                                        .get_connection()
                                                        .expect("failed to connect to Redis");
    let result: Vec<String> = connection.sinter(tags).expect("failed to execute SINTER");
    return result;
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(search_files)
            .service(save_files)
            .service(actix_files::Files::new("/images", "/images").show_files_listing())
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
