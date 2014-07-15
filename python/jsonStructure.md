```
 {
    user : Ben,
    chats : {
        George3 : {//chat partner is key for entire thread
            messages :
            [//array
                {
                    user : George3,
                    date : 07/04/1776 (+hrs:sec), //use some standard date format
                    text : "dude, pay taxes"
                },
                {
                    user : Ben,
                    date : 07/04/1776 (+hrs:sec),
                    text : "FUCK. THAT."
                }
            ],
        },

        Tom : {
            messages : [//array
                {
                    user : Tom,
                    date : 07/04/1776 (+hrs:sec),
                    text : "he said WHAT?"
                },
                {
                    user : Ben,
                    date : 07/04/1776 (+hrs:sec),
                    text : "I know, right?"
                }
            ],
        },

        John : {....}

    }//end chats
}
```