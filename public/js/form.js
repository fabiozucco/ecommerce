function send (event) {
  event.preventDefault();

  var name = $("#name").val();
  var lastname = $("#lastname").val();
  var email = $("#email").val();
  var phone = $("#phone").val();
  var birthday = $("#birthday").val();
  var cep = $("#cep").val();
  var state = $("#state").val();
  var city= $("#city").val();
  var neighborhood = $("#neighborhood").val();
  var address = $("#address").val();
  var number = $("#number").val();
  var complement = $("#complement").val();
  var password = $("#password").val();
  var confirmpassword = $("#confirmpassword").val();
  var id = $("#id").val();


  // VÁLIDAÇÃO DOS CAMPOS DO FORMULÁRIO
  if (name == "") {
      toastr["error"]("Campo nome obrigatório");
      return;
  }

  if (lastname == "") {
      toastr["error"]("Campo sobrenome obrigatório");
      return
  }

  if (email == "") {
      toastr["error"]("Campo email obrigatório");
      return
  }
  console.log(phone);
  if (phone == "" || phone.length < 9) {
      toastr["error"]("Campo telefone obrigatório");
      return
  }

  if (birthday == "") {
     toastr["error"]("Campo data de nascimento obrigatório");
     return
  }

  if (cep == "") {
        toastr["error"]("Campo CEP obrigatório");
        return
  }

  if (state == "") {
       toastr["error"]("Campo estado obrigatório");
       return
  }

  if (city == "") {
      toastr["error"]("Campo cidade obrigatório");
      return
  }

  if (neighborhood == "") {
      toastr["error"]("Campo bairro obrigatório");
      return
  }

  if (address == "") {
       toastr["error"]("Campo endereço obrigatório");
       return
  }

  if (number == "") {
       toastr["error"]("Campo número obrigatório");
       return
  }

  if (complement == "") {
       toastr["error"]("Campo complemento obrigatório");
       return
  }
  
  if (password == "") {
        toastr["error"]("Campo senha obrigatório");
        return
   }

   if (password.length < 8) {
        toastr["error"]("Senha mínimo 8 caracteres");
        return
   }

   if (confirmpassword == "") {
        toastr["error"]("Confirme sua senha");
        return
   }

   if (password !== confirmpassword) {
        toastr["error"]("Senhas incompatíveis");
        return
   }

    var data = {
      name: name,
      lastname: lastname,
      email: email,
      phone: phone,
      cep: cep,
      state: state,
      city: city,
      neighborhood: neighborhood,
      address: address,
      number: number,
      complement: complement,
      password: password,
      birthday: birthday
    }

      // ENVIA DADOS PARA O MONGODB
      $.post('/form', data, function (res) {
             if(res === 'ok') {
               toastr["success"]("Cadastro realizado com sucesso!");
               setTimeout(function(){
                location.reload();
              },1500);
               $('form').trigger('reset');
             } else {
               toastr["error"]("Erro: " + res);
              }
  })
}

// LIMPA CAMPOS DO FORMULÁRIO
function clear (){
  $("#name").val("");
  $("#lastname").val("");
  $("#email").val("");
  $("#phone").val("");
  $("#cep").val("");
  $("#state").val("");
  $("#city").val("");
  $("#neighborhood").val("");
  $("#address").val("");
  $("#number").val("");
  $("#complement").val("");
  $("#birthday").val("");
}

$(document).ready(function() {
 function limpa_formulário_cep() {
     // Limpa valores do formulário de cep.
     $("#address").val("");
     $("#neighborhood").val("");
     $("#city").val("");
     $("#state").val("");
     $("#complement").val("");
 }

 //Quando o campo cep perde o foco.
 $("#cep").keyup(function() {

  //Nova variável "cep" somente com dígitos.
     var cep = $(this).val().replace(/\D/g, '');

  //Verifica se campo cep possui valor informado.
     if (cep.length>="8") {

  //Expressão regular para validar o CEP.
    var validacep = /^[0-9]{8}$/;

  //Valida o formato do CEP.
    if(validacep.test(cep)) {

  //Preenche os campos com "..." enquanto consulta webservice.
    $("#address").val("...");
    $("#neighborhood").val("...");
    $("#city").val("...");
    $("#state").val("...");
    $("#complement").val("...");

//Consulta o webservice viacep.com.br/
$.getJSON("https://viacep.com.br/ws/"+ cep +"/json/?callback=?", function(dados) {
  if (!("erro" in dados)) {
    //Atualiza os campos com os valores da consulta.
    $("#address").val(dados.logradouro);
    $("#neighborhood").val(dados.bairro);
    $("#city").val(dados.localidade);
    $("#state").val(dados.uf);
    $("#complement").val(dados.complemento);
   //end if.
} else {
    //CEP pesquisado não foi encontrado.
    limpa_formulário_cep();
    alert("CEP não encontrado.");
}
    });
}
else {
    //cep é inválido.
    limpa_formulário_cep();
     toastr["error"]("Formato CEP é inválido");
   }
} else {
      //cep sem valor, limpa formulário.
      limpa_formulário_cep();
     }
 });
});

// PHONE MASK
$("#phone")
        .mask("(99) 9999-9999?9")
        // .focusout(function (event) {
        //     var target, phone, element;
        //     target = (event.currentTarget) ? event.currentTarget : event.srcElement;
        //     phone = target.value.replace(/\D/g, '');
        //     element = $(target);
        //     element.unmask();
        //     if(phone.length > 10) {
        //         element.mask("(99) 99999-999?9");
        //     } else {
        //         element.mask("(99) 9999-9999?9");
        //     }
        // });