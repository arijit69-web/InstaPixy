const {body}=require('express-validator')
const cheerio=require('cheerio')
module.exports=[
    body("title").not().isEmpty().withMessage('Title Cannot be Empty')
    .isLength({max:100}).withMessage('Title Cannot be Greater Than 100 Characters')
    .trim()
    ,
    body('tags')
    .not().isEmpty().withMessage('Tags Cannot be Empty'),


    body('body')
    .not().isEmpty().withMessage('Body Cannot be Empty')
    .custom(value=>{
        let node = cheerio.load(value)
        let text=node.text()
        if(text.length>5000)
        {
            throw new Error('Body Cannot be Greater than 5000 Characters')
        }
        return true
    })
]
