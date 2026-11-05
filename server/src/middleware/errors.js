import {randomUUID} from 'node:crypto';
export function requestLogger(req,res,next){req.id=randomUUID();const start=Date.now();res.on('finish',()=>console.log(JSON.stringify({id:req.id,method:req.method,route:req.route?.path||req.path,status:res.statusCode,ms:Date.now()-start})));next();}
export function notFound(req,res){res.status(404).json({error:{code:'NOT_FOUND',message:'Route not found'}});}
export function errorHandler(err,req,res,next){if(res.headersSent)return next(err);const status=err.status|| (err.name==='MulterError'?400:500);const code=err.code||'INTERNAL_ERROR';const message=process.env.NODE_ENV==='production'&&status>=500?'Something went wrong. Please try again.':(err.message||'Request failed');res.status(status).json({error:{code,message}});}
