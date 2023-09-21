use actix_web::{get, post, web, App, HttpResponse, HttpRequest, HttpServer, Responder};
use actix_multipart::Multipart;
use futures_util::TryStreamExt;

#[get("/get")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/upload")]
async fn save_files(mut payload: Multipart, req: HttpRequest) -> impl Responder {
    println!("called!");
    loop {
        if let Ok(Some(field)) = payload.try_next().await {
            println!("filename {}", field.content_disposition().get_filename().unwrap());
        } else { break; }
    }
    HttpResponse::Ok().body("Hey there!")
}

async fn manual_hello() -> impl Responder {
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
