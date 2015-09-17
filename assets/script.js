$(document).ready(function(){
    
    var data = [['date', 'datepicker', true, 'date']]

    $('#test1').select2({
        placeholder: "Select Sequencers",
        allowClear: true
    });
    
    $('#test2').select2();
    $( "#datepicker" ).datepicker();
    
    $("#submitForm").click(function(){
        saveFile();
    });
    
});

function saveFile(){
    
    var data = [[$('#datepicker').val(), 20, 0, 1, 1017281], [1850, 20, 0, 2, 1003841]];
    var csv = []
    csv.push(new CSV(data, { header: ["year", "age", "status", "sex", "population"] }).encode());
    var file = new Blob(csv, {type: "text/plain;charset=utf-8"});
    saveAs(file, "example.csv");
    
}

function getValue(){
        
}
