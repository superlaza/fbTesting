//<editor-fold desc="DROPZONE.JS">
//name of options attribute is the camelized version of the form element ID
$(function(){//on DOM ready
    Dropzone.options.uploadId ={
        paramName: "file",
        dictDefaultMessage: "",
        init: function() {
            this.on('dragover', function(evt){
                $('#uploadId').addClass('animated pulse');
            });
            this.on('dragleave', function(evt){
                $('#uploadId').removeClass('animated pulse');
            });
            this.on('addedfile', function(evt){
                //console.log($('#testing').change(validateForm()));//client-side form validation
                $('#tabs').show();
                var uploadBox = $('#uploadId');
                uploadBox.removeClass('animated pulse')
                    .addClass('animated rubberBand');
                setTimeout(function() {
                    uploadBox.addClass('animated fadeOut');
                    setTimeout(function () {
                        uploadBox.remove();
                        var uploadImg = $('#uploadImg');
                        uploadImg.css({
                            "display": "block",
                            "margin-left": String((uploadImg.parent().width()-uploadImg.width())/2) +"px"
                        });
                    }, 1000);
                }, 500);
            });
        }//end init
    };//end options
});//end ondocready
//</editor-fold>