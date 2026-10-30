import {Router} from "express";import {z} from "zod";import {prisma} from "../lib/prisma.js";import {requireAuth} from "../middleware/auth.js";
const router=Router();
// Public intake endpoint: connect each of the three existing website forms to this route.
router.post("/",async(req,res)=>{const parsed=z.object({formType:z.string().min(1).max(100),name:z.string().optional(),email:z.string().optional(),phone:z.string().optional(),message:z.string().optional()}).passthrough().safeParse(req.body);if(!parsed.success)return res.status(400).json({message:"Invalid enquiry data"});const d=parsed.data;const lead=await prisma.lead.create({data:{formType:d.formType,name:d.name??"",email:d.email??"",phone:d.phone??"",message:d.message??"",payload:d as any}});res.status(201).json({success:true,id:lead.id});});
router.get("/",requireAuth,async(_req,res)=>res.json(await prisma.lead.findMany({orderBy:{createdAt:"desc"}})));
router.patch("/:id",requireAuth,async(req,res)=>{const parsed=z.object({status:z.enum(["NEW","CONTACTED","CLOSED"])}).safeParse(req.body);if(!parsed.success)return res.status(400).json({message:"Invalid lead status"});try{res.json(await prisma.lead.update({where:{id:req.params.id},data:{status:parsed.data.status}}));}catch{return res.status(404).json({message:"Lead not found"});}});
export default router;
