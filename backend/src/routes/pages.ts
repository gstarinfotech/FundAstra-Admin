import { Router } from "express";import {z} from "zod";import {prisma} from "../lib/prisma.js";import {requireAuth} from "../middleware/auth.js";
const router=Router();router.use(requireAuth);
const schema=z.object({metaTitle:z.string().default(""),metaDescription:z.string().default(""),canonicalUrl:z.string().default(""),focusKeyword:z.string().default(""),ogTitle:z.string().default(""),ogDescription:z.string().default(""),ogImage:z.string().default(""),robotsIndex:z.boolean().default(true),robotsFollow:z.boolean().default(true),schemaMarkup:z.any().optional().nullable()});
router.get("/",async(_req,res)=>res.json(await prisma.pageSeo.findMany({orderBy:{path:"asc"}})));
router.put("/:id",async(req,res)=>{const parsed=schema.partial().safeParse(req.body);if(!parsed.success)return res.status(400).json({message:"Invalid SEO data"});try{res.json(await prisma.pageSeo.update({where:{id:req.params.id},data:parsed.data}));}catch{return res.status(404).json({message:"Existing page not found"});}});
export default router;
