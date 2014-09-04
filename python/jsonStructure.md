```
 {
    user : Ben,
    chats : {
        [Ben, George3] : {//all participants are used as key for this thread
            messages :
            [//array
                {
                    user : George3,
                    date : 07/04/1776 (+hrs:sec), //use some standard date format
                    text : "dude, pay taxes"
                    words : [[word_count]]
                },

                ...
            ],
        },

        John : {....}

    }//end chats
}
```