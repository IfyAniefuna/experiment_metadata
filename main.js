/* -*- Mode: js2; indent-tabs-mode: nil; js2-basic-offset: 2; -*- */
/* global $, Blob, saveAs, CSV, d3, JSZip, _ */
// CSV: https://github.com/knrz/CSV.js/

var taxonomy_id_list = [];
var taxonomy_id_strings;
var Accession_list = [];
var Accession_strings;

//Spreadsheet validation values
var data_type_options = ['DNA-seq', 'RNA-seq', 'ChIP-seq', 'ChIP-exo', 'Ribo-seq']
var base_media_options = ['M9', 'LB', 'DM25', 'RPMI', 'MHB']
var isolate_options = ['clonal', 'population']
var machine_options = ['MiSeq', 'NextSeq', 'HiSeq']
var carbon_source_options = ['Acetate', 'Fructose', 'Glucose', 'Galactose', 'Glycerol', 'Xylose','Sucrose']
var nitrogen_source_options = ['NH4Cl', '(NH4)2SO4', 'Glutamine', 'Glutamate']
var phosphorous_source_options = ['KH2PO4']
var sulfur_source_options = ['MgSO4']
var electron_acceptor_options= ['O2', 'NO3', 'SO4']
var antibiotic_options = ['Kanamycin', 'Spectinomycin', 'Streptomycin', 'Ampicillin', 'Carbenicillin', 'Bleomycin', 'Erythromycin', 'Polymyxin B', 'Tetracycline', 'Chloramphenicol','Nafcillin']
var lib_prep_options = ['Nextera XT', 'KAPA HyperPlus', 'KAPA Stranded RNA-seq']
var lib_prep_manufacturer_options = ['Illumina', 'Kapa']
var lib_prep_cycle_options = ['50 Cycle', '76 Cycle', '150 Cycle', '300 Cycle', '500 Cycle', '600 Cycle']
var read_type_options = ['Single-end reads', 'Paired-end reads']
var read_length_options = ['31', '36', '50', '62', '76', '100', '151', '251', '301']

var data = [
  { label: 'Creator (Name)',
    id: 'creator',
    required: true,
    type: 'input',
    example: 'Ify Aniefuna'},
  { label: 'Creator Email',
    id: 'creator-email',
    required: true,
    type: 'input',
    example: 'ify.aniefuna@gmail.com' },
  { label: 'Experiment Name',
    id: 'experiment',
    required: true,
    type: 'input' },
  { label: 'Data Type',
    id: 'data-type',
    type: 'dropdown',
    custom: true,
    required: true,
    example: 'DNA-seq',
    options: data_type_options  },
  { label: 'Experiment Date (YYYY-MM-DD)',
    id: 'run-date',
    required: true,
    type: 'date',
    description: 'For sequencing experiments, use the date the sample was run.'},
  { label: 'NCBI Taxonomy ID for Strain',
    id: 'taxonomy-id',
    type: 'dropdown',
    custom: true,
    required: true,
    options_function: function(callback) {
      $.getJSON('ncbi_taxon_ids.json')
        .success(function(d) { callback(Object.keys(d), d) })
        .fail(function(e) { console.log(e) })
        .done( function(json) {
          taxonomy_id_list = Object.keys(json);
          taxonomy_id_strings = taxonomy_id_list.join();})
    } },
  { label: 'NCBI Accession ID for Strain',
    id: 'Accession',
    type: 'dropdown',
    required: true,
    custom: true,
    options_function: function(callback) {
      $.getJSON('Accession.json')
        .success(function(d) { callback(Object.keys(d), d) })
        .fail(function(e) { console.log(e) })
        .done( function(json) {
          Accession_list = Object.keys(json);
          Accession_strings = Accession_list.join();})
    } },
  { label: 'Strain description',
    id: 'strain-description',
    description: ('Provide provide a full description of the strain. ' +
                  'Guidelines for describing mutations can be found ' +
                  '<a href="http://www.hgvs.org/mutnomen/recs.html" target="_blank" tabindex="-1">here</a>.'),
    required: true,
    example: 'e.g. Keio-crp, 76A>T, D111E, ΔF508, BOP8900(ΔadhE)' },
  { label: 'Base Media',
    id: 'base-media',
    type: 'dropdown',
    required: true,
    custom: true,
    options: base_media_options },
  { label: 'Isolate  Type',
    id: 'isolate-type',
    type: 'dropdown',
    required: true,
    custom: true,
    options: isolate_options },
  { label: 'ALE number',
    id: 'ALE-number',
    min: 0,
    type: 'ALE_number',
    required: true,
    form: 'ale_single'},
  { label: 'Flask number',
    id: 'Flask-number',
    min: 0,
    type: 'ALE_number',
    required: true,
    form: 'ale_single'},
  { label: 'Isolate number',
    id: 'Isolate-number',
    min: 0,
    required: true,
    type: 'ALE_number',
    form: 'ale_single'},
  { label: 'Technical replicate number',
    required: true,
    id: 'technical-replicate-number',
    min: 0,
    type: 'ALE_number',
    form: 'ale_single'},
   { label: 'Sample Time',
    id: 'sample-time',
    type: 'number_required',
    description: 'Hours from start of experiment.'},
  { label: 'Link to reference sequence',
    id: 'Link-to-reference-sequence',
    type: 'input',
    required: true,
    description: 'Link to internal / external accession number; link to sequence file + annotation'},
   { label: 'Reference File Name',
    id: 'reference-file-name',
    required: true,
    type: 'input' },
  { label: 'Read Files',
    id: 'read-files',
    type: 'tags',
    ALErequired: true,
    description: 'Input associated read files names. Select "enter" per file name to build list.' },
  { label: 'Serial Number',
    id: 'serial-number',
    type: 'input' },
  { label: 'Growth Stage',
    id: 'growth-stage',
    example: 'mid-log' },
  { label: 'Antibody',
    id: 'antibody',
    example: 'anti-CRP' },
  { label: 'Temperature',
    description: 'Temperature in Celcius',
    id: 'temperature',
    example: '37',
    type: 'number_required',
    form: 'ale_single'},
  { label: 'Carbon Source(s)',
    id: 'carbon-source',
    type: 'dropdown',
    multiple: true,
    custom: true,
    concentration_with_default: 2,
    options: carbon_source_options },
  { label: 'Nitrogen Source(s)',
    id: 'nitrogen-source',
    type: 'dropdown',
    multiple: true,
    custom: true,
    concentration_with_default: 1,
    options: nitrogen_source_options },
  { label: 'Phosphorous Source(s)',
    id: 'phosphorous-source',
    type: 'dropdown',
    multiple: true,
    custom: true,
    concentration_with_default: 3,
    options: phosphorous_source_options },
  { label: 'Sulfur Source(s)',
    id: 'sulfur-source',
    type: 'dropdown',
    multiple: true,
    custom: true,
    concentration_with_default: 0.24,
    options: sulfur_source_options },
  { label: 'Electron acceptor(s)',
    id: 'electron-acceptor',
    type: 'dropdown',
    options: electron_acceptor_options,
    custom: true },
  { label: 'Other supplement(s)',
    id: 'supplement',
    type: 'dropdown',
    custom: true,
    options: [],
    concentration_with_default: 1,
    multiple: true,
    custom: true },
  { label: 'Antibiotic(s) added',
    id: 'antibiotic',
    type: 'dropdown',
    custom: true,
    multiple: true,
    concentration_with_default: 1,
    options: antibiotic_options },
  { label: 'Machine',
    id: 'machine',
    type: 'dropdown',
    custom: true,
    options: machine_options },
  { label: 'Library Prep Kit Manufacturer',
    id: 'library-prep-kit-manufacturer',
    type: 'dropdown',
    custom: true,
    options: lib_prep_manufacturer_options },
  { label: 'Library Prep Kit',
    id: 'library-prep-kit',
    type: 'dropdown',
    custom: true,
    options: lib_prep_options },
  { label: 'Library Prep Kit Cycles',
    id: 'library-prep-kit-cycles',
    type: 'dropdown',
    custom: true,
    options: lib_prep_cycle_options },
  { label: 'Single- or paired-end reads',
    id: 'read-type',
    type: 'dropdown',
    options: read_type_options },
  { label: 'Read Length',
    id: 'read-length',
    type: 'dropdown',
    options: read_length_options ,
    custom: true },
  { label: 'Sample Preparation and Experiment Details',
    id: 'experiment-details',
    type: 'textarea' },
  { label: 'Pre-culture details',
    id: 'Pre-culture-details',
    description: 'Medium, cultivation volume, cultivation time, inoculated with spores, mycelium from plate, mycelium from liquid culture, inoculation volume, etc.',
    type: 'textarea' },
  { label: 'Cultivation details',
    id: 'Cultivation-details',
    type: 'textarea' },
  { label: 'Environment',
    id: 'environment',
    form: 'Generic'},
  { label: 'Biological replicates',
    id: 'biological-replicates',
    type: 'number',
    default: 1,
    min: 1,
    max: 100,
    form: 'generic_single'},
  { label: 'Technical replicates',
    id: 'technical-replicates',
    type: 'number',
    default: 1,
    min: 1,
    max: 100,
    form: 'generic_single'}
]
var data_as_object = {}
    data.forEach(function(d) { data_as_object[d.id] = d })
var multiplefiles = false;
var files = [];
var Dragfile = false
var SIZEOFFILES = 0
var new_files = []
var original_file_content = []
var ifSpreadsheet = false;
var header = [];
var spreadsheet_val = [];
var spreadsheet_id = [];
var spreadsheet_data_array = [];
var spreadsheet_dict = {};
var correct_format_files_ALE = [];
var correct_format_files_Generic = [];
var data_type_options_strings = data_type_options.join()
var base_media_options_strings = base_media_options.join()
var isolate_options_strings = isolate_options.join()
var machine_options_strings = machine_options.join()
var carbon_source_options_strings = carbon_source_options.join()
var nitrogen_source_options_strings = nitrogen_source_options.join()
var phosphorous_source_options_strings = phosphorous_source_options.join()
var sulfur_source_options_strings = sulfur_source_options.join()
var electron_acceptor_options_strings = electron_acceptor_options.join()
var antibiotic_options_strings = antibiotic_options.join()
var lib_prep_options_strings = lib_prep_options.join()
var lib_prep_manufacturer_options_strings = lib_prep_manufacturer_options.join()
var lib_prep_cycle_options_strings = lib_prep_cycle_options.join()
var read_type_options_strings = read_type_options.join()
var read_length_options_strings = read_length_options.join()

//moifications

var concentrationlist = ['carbon-source','nitrogen-source','phosphorous-source','sulfur-source','supplement']
var antibiotic_concentration = '(ug/mL)'
var change_concentrations = '(g/L)'
var temperature_value = '(Celcius)'

var output_file_name = "Metadata_spreadsheet"
var header_generic = []
var header_ale = []
var required_input_list = []


$(document).ready(function(){

  //single metadata form on load
  document.getElementById('single_metadata_sheet').style.display = 'none'
  document.getElementById('single_file_instructions_gen').style.display = 'none'
  document.getElementById('single_file_instructions_ale').style.display = 'none'
  document.getElementById('folder-name-panel').style.display = 'none'
  document.getElementById('Save_metadata').style.display = 'none'

  //metadata spreadsheet on load
  document.getElementById('spreadsheet_instructions_gen').style.display = 'none'
  document.getElementById('spreadsheet_instructions_ale').style.display = 'none'
  document.getElementById('csv_drag_and_drop_spreadsheet').style.display = 'none'


  // add the uploader
  create_uploaders()

  create_form('Generic')

  // submit
  $('#submit').click(function(){
    if (!check_required())
      return
    var data_array = get_data_array()
    if (workflow == 'generic_single') {
      save_generic_metadata(data_array)
    } 
    else  if (workflow == 'ale_single') {
      save_ale_metadata(data_array)
    }
  })


  $('#download_example_spreadsheet').click(function(){

      console.log(Accession_strings)


    var example_output = [["Name"],[,"Email"],[,"Title of Experiment"],
          [,'"Data type, Input one of the following:  "' + "[" + data_type_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],
          [,"Enter Experiment Date (YYYY-MM-DD)"],[,'"NCBI Taxonomy ID for Strain, Input one of the following: "' + "[" + taxonomy_id_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" ],
          [,'"NCBI Accession ID for Strain, Input one of the following: "' + "[" + Accession_strings.replace(/[^\w\s\-\.\(\)]/gi, ']-[') + "]" ],
          [,'"Provide a full description of the strain. e.g. Keio-crp, 76A>T, D111E, ΔF508, BOP8900(ΔadhE)"'],
          [,'"Base media, Input one of the following: "' + "[" + base_media_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],[,'"Isolate type, Input one of the following: "' + "[" + isolate_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],
          [,"Insert ALE number"],[,"Insert Flask number"],[,"Insert Isolate number"],[,"Insert Technical Replicate Number"],
          [,"Sample time is the hours from the start of experiment"],[,"Link to internal / external accession number; link to sequence file + annotation"],[,'"Input associated (comma seperated) Read Files. e.g. file1.fastq,file2.fastq,file3.fastq,file4.fastq"'],
          [,"Insert Serial Number"],[,"Insert Growth stage. e.g. mid-log"],
          [,"Insert Antibody. e.g. anti-CRP"],[,"Insert Temperature in Celcius. e.g. 37"],[,'"Carbon Source, Input one of the following: "' + "[" + carbon_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" + " followed by the concentration in (g/L) EXAMPLE: Glucose(1)"],
          [,'"Nitrogen Source, Input one of the following: "' + "[" + nitrogen_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" + " followed by the concentration in (g/L) EXAMPLE: NH4Cl(4)"],[,'"Phosphorous Source, Input "' + "[" + phosphorous_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" + " followed by the concentration in (g/L) EXAMPLE: KH2PO4(5)"],
          [,'"Sulfur Source, Input "' + "[" + sulfur_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" + " followed by the concentration in (g/L) EXAMPLE: MgSO4(3)"],[,'"Electron Acceptor, Input one of the following: "' + "[" + electron_acceptor_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],
          [,"Input any other supplement(s) followed by the concentration in (g/L) EXAMPLE: supplement(0)"],
          [,'"Input one of the following Antibiotic(s) added: "' + "[" + antibiotic_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" + " followed by the concentration (ug/mL) EXAMPLE: Ampicillin(0.5)"],
          [,'"Machine, Input one of the following: "' + "[" + machine_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],[,'"Library Prep Kit Manufacturer, Input one of the following: "' + "[" + lib_prep_manufacturer_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],
          [,'"Library Prep Kit, Input one of the following: "' + "[" + lib_prep_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],
          [,'"Library Prep Kit Cycles, Input one of the following: "' + "[" + lib_prep_cycle_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],[,'"Read Type, Input one of the following: "' + "[" + read_type_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],
          [,'"Read Length, Input one of the following: "' + "[" + read_length_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]"],[,"Input Sample Preparation and Experiment Details"],[,'"Information on the pre-culture: Medium, cultivation volume, cultivation time, inoculated with spores, mycelium from plate, mycelium from liquid culture, inoculation volume, etc."'],
          [,'"Data on cultivation: Volume, fermenter/shake flask, baffle, springs, etc."'],[,"Describe any other environmental parameters."],[,"Insert Biological replicates number"],
          [,"Insert Technical replicates number"],[,"Input Reference Genome file name"],
          [,"\n" + "creator"],[,"creator-email"],[,"experiment"],
          [,"data-type"],[,"run-date"],[,"taxonomy-id"],[,"Accession"],[,"strain-description"],
          [,"base-media"],[,"isolate-type"],[,"ALE-number"],[,"Flask-number"],
          [,"Isolate-number"],[,"technical-replicate-number"],[,"sample-time"],[,"Link-to-reference-sequence"],[,"read-files"],
          [,"serial-number"],[,"growth-stage"],[,"antibody"],[,"temperature"],
          [,"carbon-source"],[,"nitrogen-source"],[,"phosphorous-source"],[,"sulfur-source"],
          [,"electron-acceptor"],[,"supplement"],[,"antibiotic"],[,"machine"],
          [,"library-prep-kit-manufacturer"],[,"library-prep-kit"],[,"library-prep-kit-cycles"],
          [,"read-type"],[,"read-length"],[,"experiment-details"],[,"Pre-culture-details"],[,"Cultivation-details"],[,"environment"],
          [,"biological-replicates"],[,"technical-replicates"],[,"reference-file-name"]]


    required_input_list = [["creator"],["creator-email"],["data-type"],["read-files"],["run-date"],["taxonomy-id"],["experiment"],["strain-description"],["base-media"],["isolate-type"],["ALE-number"],["Flask-number"],["Isolate-number"],["technical-replicate-number"],["Link-to-reference-sequence"],["reference-file-name"],["Accession"]]


    Liststart = false
    Listsplice = false
    if (workflow == 'generic_spreadsheet') {

      list_of_required_ALE = ["read-files", "ALE-number", "Flask-number", "Isolate-number", "technical-replicate-number"]

      for(var j = 0; j < required_input_list.length; j++) {


        if (list_of_required_ALE.indexOf(required_input_list[j][0]) >= 0) {
            required_input_list.splice(j, 1);
            j = j - 1    
        }
      }

      list_of_ALE_only = ["Insert ALE number", "Insert Flask number", "Insert Isolate number", "Insert Technical Replicate Number", "ALE-number", "Flask-number", "Isolate-number", "technical-replicate-number"]
      for(var i = 0; i < example_output.length; i++) {

        if (list_of_ALE_only.indexOf(example_output[i][1]) >= 0) {
            example_output.splice(i, 1);
            i = i - 1    
            Listsplice = true    
        }

        if (("\n" + "creator").indexOf(example_output[i][1]) >= 0 || Liststart == true) {
            if (Liststart == false){
              header_generic.push(["creator"])
            }

            if (Listsplice == true) {
               Listsplice = false
               Liststart = false
            }
          
            if (Liststart == true ){
              header_generic.push([example_output[i][1]])
            }

            Liststart = true

        }

      }

      var file = new Blob(example_output, { type: 'text/plain;charset=utf-8' })
      saveAs(file, output_file_name + '.csv')
    }

    else if (workflow == 'ale_spreadsheet') {

      list_of_required_Generic = []

      for(var j = 0; j < required_input_list.length; j++) {

        if (list_of_required_Generic.indexOf(required_input_list[j][0]) >= 0) {
            required_input_list.splice(j, 1);
            j = j - 1    
        }
      }

      list_of_Generic_only = ["Insert Biological replicates number", "Insert Technical replicates number", "biological-replicates", "technical-replicates"]

      for(var i = 0; i < example_output.length; i++) {

        if (list_of_Generic_only.indexOf(example_output[i][1]) >= 0) {
            example_output.splice(i, 1);
            i = i - 1
            Listsplice = true    
        }

        if (("\n" + "creator").indexOf(example_output[i][1]) >= 0 || Liststart == true) {
            if (Liststart == false){
              header_ale.push(["creator"])
            }

            if (Listsplice == true) {
               Listsplice = false
               Liststart = false
            }
          
            if (Liststart == true ){
              header_ale.push([example_output[i][1]])
            }

            Liststart = true
        }

      }

      var file = new Blob(example_output, { type: 'text/plain;charset=utf-8' })
      saveAs(file, output_file_name + '.csv')

    }
  })
})

function create_form(form_type) {

  files = [];
  new_files = []
  original_file_content = []
  header = []
  workflow = form_type

  var center_column = $('#center-column')
  $(".alert").remove();

  // Remove all child elements of center-column to start with blank sheet.
  while (center_column[0].firstChild) {
    center_column[0].removeChild(center_column[0].firstChild)
  }

  // Hide/show the Optional: Ale Specific Drag and drop CSV box

  if ( (form_type == 'generic_single') ){
    document.getElementById('single_metadata_sheet').style.display = 'block'
    document.getElementById('single_file_instructions_gen').style.display = 'block'
    document.getElementById('folder-name-panel').style.display = 'block'
    document.getElementById('Save_metadata').style.display = 'block'
    document.getElementById('intropage').style.display = 'none'

  }
  if ( (form_type == 'ale_single') ){
    document.getElementById('single_metadata_sheet').style.display = 'block'
    document.getElementById('single_file_instructions_ale').style.display = 'block'
    document.getElementById('Save_metadata').style.display = 'block'
    document.getElementById('intropage').style.display = 'none'

  }
  if ( (form_type == 'generic_spreadsheet') ) {
    document.getElementById('spreadsheet_instructions_gen').style.display = 'block'
    document.getElementById('csv_drag_and_drop_spreadsheet').style.display = 'block'
    document.getElementById('intropage').style.display = 'none'

  }
  if ( (form_type == 'ale_spreadsheet') ) {
    document.getElementById('spreadsheet_instructions_ale').style.display = 'block'
    document.getElementById('csv_drag_and_drop_spreadsheet').style.display = 'block'
    document.getElementById('intropage').style.display = 'none'

  }

  // add the form
  for(var i = 0; i < data.length; i++) {
    // add the input
    if (data[i]['form'] == form_type || data[i]['form'] == undefined) {
      create_input(data[i], center_column, i === 0)
    }
  }
}

function get_data_array() {

  var data_array = []
  for(var i = 0; i < data.length; i++){
    var val = get_value(data[i]['id'])
    if (concentrationlist.includes(data[i]['id'])) {
      data_array.push([data[i]['id'] + change_concentrations, val])
    }
    else if (data[i]['id'] == 'antibiotic') {
      data_array.push([data[i]['id'] + antibiotic_concentration, val])
    }
    else if (data[i]['id'] == 'temperature') {
      data_array.push([data[i]['id'] + temperature_value, val])
    }
    else {
      data_array.push([data[i]['id'], val])
    }
  }

  return data_array

}

function check_required() {
  if ($('.required.alert-danger').length !== 0) {
    $('#submit').get(0).disabled = true
    $('#required-to-submit').show()
    return false
  } else {
    $('#submit').get(0).disabled = false
    $('#required-to-submit').hide()
    return true
  }
}


function create_uploaders() {
  $('#spreadsheet-upload').fileReaderJS({
    dragClass: 'drag',
    readAsDefault: 'Text',
    on: {
      load: handle_upload_spreadsheet
    }
  });

  $('#file-upload').fileReaderJS({
    dragClass: 'drag',
    readAsDefault: 'Text',
    on: {
      load: handle_upload
    }
  });
}

function handle_upload(e, file) {
  var csv_data = e.target.result,
  arrays = new CSV(csv_data).parse()
  var file_id = file.name; //name of file
  if (file_id.indexOf(".csv") == -1) {
    return
  }
  for (var j = 0; j < files.length; j++) {
    if (JSON.stringify(files[j]) == JSON.stringify(arrays)) {
      return
    }
  };

  files.push(arrays); // data from meta data sheet

  for(var i=0; i<files.length; i++) {
     populate_metaform(files[i]);
     original_file_content = files[i]; // ORIGINAL FILE CONTENT
  }
  format_metadata();
}

function format_metadata() {
  if (workflow == 'Generic') {
    var array_data = []
    for(var i = 0; i < data.length; i++){
      var val = get_value(data[i]['id'])
      val = val.toString()

      array_data.push([data[i]['id'], val])
    }
    correct_format_files_Generic.push(array_data)
  }
  else {
    var array_data = []
    for(var i = 0; i < data.length; i++){
      var val = get_value(data[i]['id'])
      val = val.toString()

      array_data.push([data[i]['id'], val])
    }
    correct_format_files_ALE.push(array_data)
  }

}

function populate_metaform(file_data) {
  for (var i = 0; i < file_data.length; i++)
    set_value(file_data[i][0], file_data[i][1] + '')
}


function get_zip_name() {
  return get_value('experiment').toString() + '_' + folder_name()
}

function get_zip_name_spreadsheet() {
  var experiment;
  var rundate;
  var datatype;

  for (const [key, val] of Object.entries(spreadsheet_dict)) {
      if (key == 'experiment') {
        experiment = val
      }
      if (key == 'run-date') {
        rundate = val
      }
      if (key == 'data-type') {
        datatype = val
      }
  }
  return (experiment + '_' + rundate + '_' + datatype)

}

function get_file_name_spreadsheet() {

  var experiment;
  var rundate;
  var datatype;
  var ALE_numb;
  var Flask_numb;
  var Isolate_numb;
  var tech_rep_numb;
  var serial_num;

  for (const [key, val] of Object.entries(spreadsheet_dict)) {
      if (key == 'experiment') {
        experiment = val
      }
      if (key == 'run-date') {
        rundate = val
      }
      if (key == 'data-type') {
        datatype = val
      }
      if (key == 'ALE-number') {
        ALE_numb = val
      }
      if (key == 'Flask-number') {
        Flask_numb = val
      }
      if (key == 'Isolate-number') {
        Isolate_numb = val
      }
      if (key == 'technical-replicate-number') {
        tech_rep_numb = val
      }
      if (key == 'serial-number') {
        serial_num = val
      }


  }
  rundate = rundate.replace(' ', '').replace(/\//g, '-')

  if (serial_num != '') {
    if ((workflow == 'generic_single')  || (workflow == 'generic_spreadsheet'))  {
     return (serial_num + '_' + experiment + '_' + rundate + '_' + datatype)

    }
    else if ((workflow == 'ale_single') ||  (workflow == 'ale_spreadsheet'))  {
      return (serial_num + '_' + experiment + '_' + ALE_numb + '_' + Flask_numb
       + '_' + Isolate_numb + '_' + tech_rep_numb)
    }
  }

  else {
    if ((workflow == 'generic_single')  || (workflow == 'generic_spreadsheet')) {
     return (experiment + '_' + rundate + '_' + datatype)

    }
    else if ((workflow == 'ale_single') ||  (workflow == 'ale_spreadsheet')){
      return (experiment + '_' + ALE_numb + '_' + Flask_numb
       + '_' + Isolate_numb + '_' + tech_rep_numb)
    }
  }
}

function get_file_name() {
  var label = folder_name();
  if ((workflow == 'generic_single')  || (workflow == 'generic_spreadsheet')) {
     var lib_prep = get_lib_prep_code(get_value('library-prep-kit').toString())
    if (lib_prep != '')
      lib_prep = '_' + lib_prep

    return get_value('experiment').toString() + '_' + label

  }
  else if ((workflow == 'ale_single')  || (workflow == 'ale_spreadsheet')) {
    var lib_prep = get_lib_prep_code(get_value('library-prep-kit').toString())
    if (lib_prep != '') {
      lib_prep = '_' + lib_prep
    }

    return get_value('experiment').toString()
    + lib_prep
    + '_'
    + get_value('ALE-number').toString()
    + '-' + get_value('Flask-number').toString()
    + '-' + get_value('Isolate-number').toString()
    + '-' + get_value('technical-replicate-number').toString()
  }
}

function handle_upload_spreadsheet(e, file) {
  $(".alert").remove();
  ifSpreadsheet = true;
  if (workflow == 'generic_spreadsheet') {
    header = header_generic
  }
  else if (workflow == 'ale_spreadsheet') {
    header = header_ale
  }


  var zip = new JSZip()
  var input_csv_data = e.target.result,
      variable_file_name_array = new CSV(input_csv_data).parse()

  var output_sample_name_array = []
  var alert = false;
  found = false;

  if (variable_file_name_array.length == 2) {
    addAlert("Spreadsheet requires input")
    return;
  }
  filecounter = 0
  for (var name_idx = 2; name_idx < variable_file_name_array.length; name_idx++) {
    filecounter++;
    spreadsheet_val = [];
    spreadsheet_id = [];
    spreadsheet_data_array = [];
    spreadsheet_dict = {};
    var myREfordate = new RegExp (['^((0?[13578]|10|12)(-|\/)(([1-9])|(0[1-9])|([12])',
      '([0-9]?)|(3[01]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])',
      '(\d{1}))|(0?[2469]|11)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))',
      '(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1})))$'].join(''));

    for (var i = 0; i < variable_file_name_array[1].length; i++) {
      if(variable_file_name_array[1][i] == "data-type") {
         if (!dropdown_validation(data_type_options ,variable_file_name_array[name_idx][i])) {
            addAlert("Data type Field ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + data_type_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
         }
      }

      if(variable_file_name_array[1][i] == "run-date") {
        if(myREfordate.test(variable_file_name_array[name_idx][i])
         && (variable_file_name_array[name_idx][i]) != '') {
          addAlert("Enter Valid Experiment Date (YYYY-MM-DD) [Line " + (name_idx+1) + "]")
          alert = true;
        }
      }

      if(variable_file_name_array[1][i] == "taxonomy-id") {

          if (!dropdown_validation(taxonomy_id_list,variable_file_name_array[name_idx][i])) {
            addAlert("NCBI Taxonomy ID ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + taxonomy_id_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "Accession") {

          if (!dropdown_validation(Accession_list,variable_file_name_array[name_idx][i])) {
            addAlert("NCBI Accession ID ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + Accession_strings.replace(/[^\w\s\-\.\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "base-media") {
          if (!dropdown_validation(base_media_options,variable_file_name_array[name_idx][i])) {
            addAlert("Base media ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + base_media_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "isolate-type") {
          if (!dropdown_validation(isolate_options,variable_file_name_array[name_idx][i])) {
            addAlert("Isolate type ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + isolate_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
     if(variable_file_name_array[1][i] == "machine") {
          if (!dropdown_validation(machine_options ,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Machine ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + machine_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "library-prep-kit-manufacturer") {
          if (!dropdown_validation(lib_prep_manufacturer_options,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Library Prep Kit Manufacturer ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + lib_prep_manufacturer_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "library-prep-kit") {
          if (!dropdown_validation(lib_prep_options ,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Library Prep Kit ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + lib_prep_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "library-prep-kit-cycles") {
          if (!dropdown_validation(lib_prep_cycle_options,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Library Prep Kit Cycles ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + lib_prep_cycle_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "read-type") {
          if (!dropdown_validation(read_type_options,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Read Type ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "["+ read_type_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[')+ "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "read-length") {
          if (!dropdown_validation(read_length_options ,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Read Length ERROR [Line " + (name_idx+1) + "], Please input one of the following: " + "[" + read_length_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if((variable_file_name_array[1][i] == "ALE-number") || (variable_file_name_array[1][i] == "Flask-number")
        || (variable_file_name_array[1][i] == "technical-replicate-number") || (variable_file_name_array[1][i] == "Isolate-number")) {
        if (!(/^\d+$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please insert a numerical value for the ALE-number, Isolate-number, Flask-number or Technical-replicate-number")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "sample-time") {
         if (!(/^\d+$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please insert numerical value for Sample time (hours from start of experiment) e.g. 4")
            alert = true;
         }
      }
      if(variable_file_name_array[1][i] == "temperature") {
        if (!(/^[+-]?(?:\d*\.)?\d+$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please insert Temperature in Celcius. e.g. 37")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "biological-replicates") {
        if (!(/^\d+$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please insert Biological replicates number")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "technical-replicates") {
        if (!(/^\d+$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please insert Technical replicates number")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "read-files") {
        if (!(/^([^\s]*)$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please input associated (comma seperated) Read Files. e.g. file1.fastq,file2.fastq,file3.fastq,file4.fastq")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "carbon-source") {
          if (!source_validation(carbon_source_options,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
             addAlert("Carbon Source ERROR [Line " + (name_idx+1) + "], Please input one of the following: "+ "[" + carbon_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[')+ "]" +" followed by the concentration in (g/L) EXAMPLE: Glucose(1)" )
             alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "nitrogen-source") {
         if (!source_validation(nitrogen_source_options,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
             addAlert("Nitrogen Source ERROR [Line " + (name_idx+1) + "], Please input one of the following: "+ "[" + nitrogen_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" +" followed by the concentration in (g/L) EXAMPLE: NH4Cl(4)")
             alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "phosphorous-source") {
          if (!source_validation(phosphorous_source_options ,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Phosphorous Source ERROR [Line " + (name_idx+1) + "], Please input "+ "[" +phosphorous_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[')+ "]" +" followed by the concentration in (g/L) EXAMPLE: KH2PO4(5)")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "sulfur-source") {
          if (!source_validation(sulfur_source_options ,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Sulfur Source ERROR [Line " + (name_idx+1) + "], Please input "+ "[" + sulfur_source_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]" +" followed by the concentration in (g/L) EXAMPLE: MgSO4(3)")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "electron-acceptor") {
          if (!(/^([^\s]*)$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("Electron Acceptor ERROR [Line " + (name_idx+1) + "], Please input one of the following: "+ "[" +electron_acceptor_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[') + "]")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "supplement") {
          list_supplment = ['/^([^\s]*)$/']
          if (!/^([^\s]*)$/.test(variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please input any other supplement(s) followed by the concentration in (g/L) EXAMPLE: supplement(0)")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "antibiotic") {
          if (!source_validation(antibiotic_options ,variable_file_name_array[name_idx][i]) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please input one of the following Antibiotic(s) added: "+ "[" + antibiotic_options_strings.replace(/[^\w\s\-\(\)]/gi, ']-[')+ "]" +" followed by the concentration (ug/mL) EXAMPLE: Ampicillin(0.5)")
            alert = true;
          }
      }
      if(variable_file_name_array[1][i] == "reference-file-name") {
        if (!(/^[a-zA-Z]+$/.test(variable_file_name_array[name_idx][i])) && (variable_file_name_array[name_idx][i]) != '') {
            addAlert("ERROR [Line " + (name_idx+1) + "], Please input Reference Genome file name")
            alert = true;
          }
      }


      for (var x = 0; x < required_input_list.length; x++) {
        if (variable_file_name_array[1][i] == required_input_list[x]) {
           if (variable_file_name_array[name_idx][i] == "") {
             addAlert("[Line " + (name_idx+1) + "], " + required_input_list[x] + " field requires input")
             alert = true;
           }
        }
      }
    spreadsheet_val.push(variable_file_name_array[name_idx][i])
    
    var headers = variable_file_name_array[1][i]
    if (concentrationlist.includes(headers)) {
      spreadsheet_id.push(headers + change_concentrations)
    }
    else if (headers == 'antibiotic') {
      spreadsheet_id.push(headers + antibiotic_concentration)
    }
    else if (headers == 'temperature') {
      spreadsheet_id.push(headers + temperature_value)
    }
    else {
      spreadsheet_id.push(headers)
    }
    spreadsheet_data_array = get_value_spreadsheet(spreadsheet_id,spreadsheet_val)
    }

    var file_name = get_file_name_spreadsheet() + "(" + filecounter + ")" + '.csv';

    var output_sample_csv_data = [new CSV(spreadsheet_data_array).encode()]
    var output_sample_metadata_file = new Blob(output_sample_csv_data, { type: 'text/plain;charset=utf-8' })
    zip.folder("MetaData Files").file(file_name, output_sample_metadata_file)
  }
    if (alert == true) {
      return;
    }

    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      saveAs(blob, get_zip_name_spreadsheet() + '.zip')
    })

}

function addAlert(message) {
    $('#alert').append('<div class="alert alert-danger alert-dismissable" id="alertdivs">' +
        '<a href="#" class="close" data-dismiss="alert"' +
        'aria-label="close">&times;</a>' + message +
        '</div>');
}

function regExpEscape(literal_string) {
    return literal_string.replace(/[^A-Za-z0-9_]/g, '\\$&');
}

function source_validation(list, index) {
  alert_call = false;
  for (var i = 0; i < list.length; i++) {
   
    regex_sources = '(?:^|\\\b)(' + regExpEscape(list[i]) + ')(?=\\\b|)\\(-?[0-9]\\d*(\\.\\d+)?\\)$'
    newregex = new RegExp(regex_sources, 'i')
    if(newregex.test(index) == true) {
        alert_call = true;
    }
  };
  return alert_call;
}

function dropdown_validation(list, index) {
  error_call = false;
  changed = false;
  for (var i = 0; i < list.length; i++) {

    if (list[i].indexOf(')') != -1) {
      list[i] = list[i].replace(/["'()]/g, "}")
      changed = true
    }
    regex_sources = '(?:^|\\b)(' + list[i] + ')(?=\\b|$)'
    newregex = new RegExp(regex_sources, 'i')
    if (changed == true) {
      index = index.replace(/["'()]/g, "}")
    }
    if(newregex.test(index) == true) {
        error_call = true;
    }
  };
  return error_call;
}


function folder_name() {
  var l = ['run-date', 'data-type'].map(function(el) {
    return get_value(el).replace(' ', '').replace(/\//g, '-')
  })
  return _.every(l) ? l.join('_') : ''
}


function update_folder_name() {
  $('#folder-name').val(folder_name())
}


function get_lib_prep_code(lib_prep_kit) {
  var lib_prep_code = ''
  if (lib_prep_kit == 'Nextera XT')
    lib_prep_code = 'NXT'
  else if (lib_prep_kit == 'KAPA HyperPlus')
    lib_prep_code = 'KHP'
  else if (lib_prep_kit == 'KAPA Stranded RNA-seq')
    lib_prep_code = 'KSR'
  return lib_prep_code
}


function save_ale_metadata(array) {
  var zip = new JSZip()
  if (files.length <= 1) {
    var file_name = get_file_name()
    var csv_data = [new CSV(array).encode()]
    var file = new Blob(csv_data, {type: 'text/plain;charset=utf-8'})

    saveAs(file, file_name + '.csv');
  }
}

function save_generic_metadata(array) {
  var zip = new JSZip();
  if (files.length <= 1) {
     var label = folder_name();
     var csv = [new CSV(array).encode()];
     var file = new Blob(csv, {type: 'text/plain;charset=utf-8'});
      saveAs(file, label + '.csv');
  }
}

function get_value_spreadsheet(spreadsheet_id, spreadsheet_val) {

  var data_array = []
  for(var i = 0; i < spreadsheet_id.length; i++){
    if (spreadsheet_id[i] == spreadsheet_id[i]) {
      data_array.push([spreadsheet_id[i], spreadsheet_val[i]])
      spreadsheet_dict[spreadsheet_id[i]] = spreadsheet_val[i]
    }
  }
  return data_array

}

var saved_ALE_number;
var saved_Flask_number;
var saved_Isolate_number;
var saved_technical_replicate_number;
var saved_ = false;
function get_value(id, input_only) {
  /** Get the value for the given input id */
  if (_.isUndefined(input_only))
    input_only = false

  // Get concentrations
  var concentrations = {}
  $('#' + id).parent().find('.concentration-input>input').each(function() {
    var el = $(this),
        val = $(this).val()
    if (val) concentrations[el.attr('id')] = val
  })


  // get the value ale
  if (saved_ == true) {
    if (id == 'ALE-number' ) {
      var vals = saved_ALE_number;
    }
    else if (id == 'Flask-number') {
      var vals = saved_Flask_number;
    }
    else if (id == 'Isolate-number') {
      var vals = saved_Isolate_number;
    }
    else if (id == 'technical-replicate-number') {
      var vals = saved_technical_replicate_number;
    }
    else {
      var vals = $('#' + id).val()
    }
  }
  else {
      var vals = $('#' + id).val()
  }

  if ((typeof vals === 'undefined') || (vals === null))
    return ''

  if (input_only)
    return vals

    // add concentrations to val
  if (_.isArray(vals)) {
    return vals.map(function(val) {
      if (val in concentrations && Dragfile == false)
        return val + '(' + concentrations[val] + ')'
      else
        return val
    })
  } else {
    return vals
  }
}

function set_value(id, value) {
 saved_ = true;
 if (id == 'ALE-number') {
      saved_ALE_number = value;
 }
 if (id == 'Flask-number') {
      saved_Flask_number = value;
 }
 if (id == 'Isolate-number') {
      saved_Isolate_number = value;
 }
 if (id == 'technical-replicate-number') {
      saved_technical_replicate_number = value;
 }


 if (!(id in data_as_object)) {
    console.warn('Unrecognized key ' + id)
    return
  }
  var sel = $('#' + id)
  if (sel.data('select2')) {


    var split_val = value.split(',').filter(function(x) {
      return x.replace(' ', '') !== ''
    }),
        extracted_val = extract_concentrations(split_val),
        concentrations = {}
    // for multiple selections, add the options if it doesn't exist
    var ids = [], input_val = []
    sel.find('option').each(function() {
      ids.push($(this).val())
    })
    extracted_val.forEach(function(val_obj) {
      var val = val_obj.id
      if (ids.indexOf(val) === -1)
        sel.append('<option value="' + val + '">' + val + '</option>')
      // for the input
      input_val.push(val)
      // for the concentrations
      if (val_obj.concentration)
        concentrations[val] = val_obj.concentration

    })
    sel.val(input_val).trigger('change')

      // update the concentration
      if (Object.keys(concentrations).length > 0) {
        draw_concentrations(id,
                          data_as_object[id]['concentration_with_default'],
                          concentrations)
      }
  }
    sel.val(value).trigger('change')

  // update UI
  update_required_label(id, value)
  update_folder_name()
}


function update_required_label(id, value) {
  if (value === '') {
    $('#required-alert-' + id)
      .addClass('alert-danger')
      .removeClass('alert-success')
  } else {
    $('#required-alert-' + id)
      .addClass('alert-success')
      .removeClass('alert-danger')
  }
  if (multiplefiles != true) {
    check_required()
  }
}


function add_form_container(html, label, required, id, description, custom, multiple, none, ALErequired) {
  var required_str, custom_mult_str, description_str
  if (required || ALErequired)
    required_str = '<span id="required-alert-' + id + '" class="required alert alert-danger" role="alert">(Required)</span>'
  else
    required_str = ''
  if (none)
    custom_mult_str = ''
  else if (custom && multiple && (workflow == 'generic_single'))
    custom_mult_str = ' (Choose one or more, including custom values)'
  else if (custom && (workflow == 'generic_single'))
    custom_mult_str = ' (Choose or enter a new value)'
  else if (multiple)
    custom_mult_str = ' (Choose one or more)'
  else
    custom_mult_str = ''

  if (description)
    description_str = '<div>' + description + '</div>'
  else
    description_str = ''

  return '<div class="form-group row"><div class="col-sm-6"><label>' + label + '</label>' + custom_mult_str +
    required_str + description_str +
    '</div><div class="col-sm-6">' + html + '</div></div>'
}


function add_dropdown_options(input_sel, options, options_data, def, select_options) {
  var options_html = ''
  for (var i = 0; i < options.length; i++) {
    var opt = options[i],
        selected_str = opt === def ? ' selected="selected"' : ''
    options_html += '<option value="'+ opt + '"' + selected_str + '>' + opt + '</option>'
  }

  input_sel.html(options_html)
  if (options_data) {
    select_options['templateResult'] = function(state) {
      return state.id + ': ' + options_data[state.id]
    }
    select_options['matcher'] = function (params, data) {
      // check both the 3-letter-id and the explanation text
      if ($.trim(params.term) === '' ||
          data.text.toLowerCase().indexOf(params.term.toLowerCase()) > -1 ||
          options_data[data.text].toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
        return data
      }
      return null
    }
  }

  // initialize select2
  input_sel.select2(select_options)

  // to avoid the default tag
  if (!def) input_sel.val([]).trigger('change')
}


function extract_concentrations(vals) {
  /** Get the ids and concentrations from strings like "Glucose(2)" */

  var out = []
  for (var i=0, l=vals.length; i<l; i++) {
    var t = vals[i],
        res = /(.*)\(([0-9.]+)\)/.exec(t)
    if (_.isNull(res))
      out.push({ id: t, concentration: null })
    else
      out.push({ id: res[1], concentration: res[2] })
  }
  return out
}


function draw_concentrations(id, def, value_dict) {
  if (_.isUndefined(value_dict)) value_dict = {}


  var sel = d3.select(d3.select('#' + id).node().parentNode)
        .selectAll('.concentration-input')
        .data(get_value(id, true), function(d) { return d })
  var div = sel.enter()
        .append('div')
        .attr('class', 'concentration-input')
  if(id == "antibiotic")
      div.append('span').text(function(d) { return d + ' concentration (ug/mL)' })
  else
      div.append('span').text(function(d) { return d + ' concentration (g/L)' })
  div.append('input').attr('type', 'number')
    .attr('id', function(d) { return d })
    .attr('class', 'form-control')
    .attr('min', '0')
    .attr('max', '1000')
    .attr('value', function(d) {
      return (d in value_dict) ? value_dict[d] : def

    })
  sel.exit().remove()
}

function create_input(data, parent_sel) {
  var label = data['label'],
      id = data['id'],
      required = data['required'],
      ALErequired = data['ALErequired'],
      description = data['description'],
      tags = data['tags'],
      type = data['type'],
      def = data['default'] || '',
      example = data['example'] || '',
      options = data['options'],
      options_function = data['options_function'],
      multiple = data['multiple'],
      custom = data['custom'],
      concentrations = data['concentrations'],
      min = data['min'],
      html = '',
      none = data['none'],
      number_required = data['number_required'],
      ALE_number = data['ALE_number'],
      after_append

  // check for some required attributes
  if (!id) console.error('No ID for ' + label)
  if (options && (type !== 'dropdown'))
    console.error('Has "options" with a type that is not "dropdown" for ' + label)
  if (min && (type !== 'number'))
    console.error('Has "min" with a type that is not "number" for ' + label)

  if (type == 'dropdown') {
    if (id != 'data-type') {
      var select_options = {
        'allowClear': true,
        'placeholder': ''
      }
    }
    else {
      var select_options = {
        'allowClear': true,
        'placeholder': 'DNA-seq'
      }
    }
    // multiple selections
    if (multiple) {
      select_options['multiple'] = true
    }
    // custom options
    if ((custom && (workflow == 'generic_single')) || (custom && (id == 'supplement'))) {
      if (none) {
        select_options['tags'] = true
          select_options['createTag'] = function(query) {
          return {
            id: query.term,
            text: query.term,
            tag: true
          }
        }
      }
      else if (!none) {
        select_options['tags'] = true
          select_options['createTag'] = function(query) {
          return {
            id: query.term,
            text: query.term + ' (custom)',
            tag: true
          }
        }
      }
    }
    if (!required) {

    }


    html = '<select id="' + id + '" style="width: 100%" ' + '></select>'

    after_append = function() {
      // prefer options to options_function
      if (!options && options_function) {
        options_function(function(options, options_data) {
          add_dropdown_options($('#' + id), options, options_data, def, select_options)
        })
      } else {
        add_dropdown_options($('#' + id), options, null, def, select_options)
      }
      if (!_.isUndefined(data['concentration_with_default'])) {
        $('#' + id).on('change', function() {
          draw_concentrations(id, data['concentration_with_default'])
        })
      }
      // when clearing, close the menu
      $('#' + id).on('select2:unselecting', function (e) {
        $(this).select2('val', '')
        e.preventDefault()
      })
    }
  } else if (type === 'tags') {
      html = '<input class="tagsinput" id="' + id + '" type="text" placeholder="add..." value="" data-role="tagsinput"></input>';
  }
  else if (type === 'date') {
    html = '<input type="text" class="form-control" id="' + id + '" value="' + def + '"' +
      ' placeholder="' + example + '" ' + ' style="width: 100%" >',
    after_append = function() {
      $('#' + id).datepicker({ format: 'yyyy-mm-dd' })
    }
  } else if (type === 'textarea') {
    html = '<textarea id="' + id + '" class="form-control" value="' + def + '" placeholder="' + example + '" ' + ' style="width: 100%" ></textarea>'
  } else if (type === 'number_required' ){
    html = '<input id="' + id + '" type="number" class="form-control"' +
      ' value="' + def + '" placeholder="' + example + '" ' + ' style="width: 100%" >'
  } else if (type === 'ALE_number' ){
    html = '<input id="' + id + '" type="number" class="form-control" min="' + min + ' value="' + def + '" placeholder="' + example + '" ' + ' style="width: 100%" >'
  } else if (type === 'number' ){
    html = '<input id="' + id + '" type="number" class="form-control" min="' + min + '"' +
      ' value="' + def + '" placeholder="' + example + '" ' + ' style="width: 100%" >'
    after_append = function() {
      $('#' + id).bootstrapNumber()
    }
  } else {
    html = '<input id="' + id + '" class="form-control" value="' + def + '" placeholder="' + example + '" ' + ' style="width: 100%" >'
  }
  if (workflow == 'generic_single' || workflow == 'generic_spreadsheet') {
      ALErequired = false
  }
  // create and run
  parent_sel.append(add_form_container(html, label, required, id, description, custom, multiple, none, ALErequired))

  $('.tagsinput').tagsinput();
  // toggle the required label
  $('#' + id).on('change', function() {
    update_required_label(id, this.value)
    if (!ifSpreadsheet) {
      update_folder_name()
    }
  })
  if (after_append) after_append()
}