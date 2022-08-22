function myFunction() {

var doc = SpreadsheetApp.getActiveSpreadsheet();
var sheet = doc.getSheetByName('Sheet1');
var values = sheet.getDataRange().getValues();



  var output = []
  for(var i=3; i < values.length; i++){
    var row ={};
    row['question']= values[i][2];
    if (row['question']){
      row['type'] = values[i][3];
      row['varname'] = values[i][1];
      row['options'] = values[i][4].split("\n");
      output.push(row);
  }
    
  }

  Logger.log( JSON.stringify({data: output}));
    var survey_id = createSurvey('test from app script')
    var ques_id ;
    var survey_page_id= createFirstSurveyPage("page",survey_id)

    for(var i=0; i < output.length ; i++){
      if (i %2 == 0){
        survey_page_id = createSurveyPage("page",survey_id,survey_page_id)
      }
      row = output[i]
      Logger.log(row.question)

      ques_id = createQuestion(survey_id,survey_page_id,row.question,row.varname,row.type,ques_id)
      for(var j=0; j < row.options.length; j++){
        createOption(survey_id,survey_page_id,ques_id,row.options[j],j)
      }
    }

}

function callAlchemerAPI(url, query_string, method ='PUT'){
  var api_token = "6cfdcbdd0ee93f0568788af05d06e3779a6b0b415e158649a1";
  var api_token_secret = "A9GgW8n2L7MmM";
  queries = {'api_token': api_token, 'api_token_secret': api_token_secret, '_method': method}
  full_url = url + generateQueryString(queries) + '&' + generateQueryString(query_string) 
  // Logger.log(full_url);
  //Logger.log("callling Alchemer API");
  var response =  UrlFetchApp.fetch(full_url)
  //Logger.log("response: " + response);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data.data
}

function generateQueryString(data) {
   const params = [];
   for (var d in data)
      params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return  params.join('&');
}

function createSurvey(title,type='survey'){
  Logger.log("creating  survey");
  var url = "https://api.alchemer.com/v5/survey/?"
  var data = {'title': title, 'type': type}
  var data = callAlchemerAPI(url,data);
  return data.id
}

function createFirstSurveyPage(title,survey_id){
  Logger.log("creating  survey page");
  var data = {'title': title}
  var url = `https://api.alchemer.com/v5/survey/${survey_id}/surveypage?`
  Logger.log(url)
  var data = callAlchemerAPI(url,data);
  return data.id
}

function createSurveyPage(title,survey_id,after){
  Logger.log("creating  survey page");
  var data = {'title': title, 'after': after}
  var url = `https://api.alchemer.com/v5/survey/${survey_id}/surveypage?`
  Logger.log(url)
  var data = callAlchemerAPI(url,data);
  return data.id
}

function createQuestion(survey_id,survey_page_id,title,varname,type,after){
 var ques_type = {'Single-select' : 'RADIO', 'Multi-select': 'checkbox'}
  Logger.log("creating question");
  var data = {'title': title, 'varname': varname, 'type': ques_type[type], 'after': after}
  var url = `https://api.alchemer.com/v5/survey/${survey_id}/surveypage/${survey_page_id}/surveyquestion?`
  Logger.log(data)
  var data = callAlchemerAPI(url,data);
  return data.id
}

function createOption(survey_id,survey_page_id,ques_id,title,value){
  Logger.log("creating option");
  var data = {'title': title,'value': value}
  var url = `https://api.alchemer.com/v5/survey/${survey_id}/surveypage/${survey_page_id}/surveyquestion/${ques_id}/surveyoption?`
  var data = callAlchemerAPI(url,data);
  return data.id

}


