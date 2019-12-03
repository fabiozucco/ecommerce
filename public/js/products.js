function send (event) {
  event.preventDefault();

  var name = $("#name").val();
  var price = $("#price").val();
  var url = $("#url").val();
  var description = $("#description").val();
  var id = $("#id").val();

  // VÁLIDAÇÃO DOS CAMPOS DO FORMULÁRIO
  if (name == "") {
      toastr["error"]("Campo NOME obrigatório");
      return;
  }

  if (price == "") {
      toastr["error"]("Campo PREÇO obrigatório");
      return;
  }

  if (url == "") {
      toastr["error"]("Campo URL obrigatório");
      return;
  }

  if (description == "") {
      toastr["error"]("Campo DESCRIÇÃO obrigatório");
      return;
  }

  else {
    var data = {
      name: name,
      price: price,
      url: url,
      description: description
    }

    if (id.length == 0) {
      // ENVIA DADOS PARA O MONGODB
      $.post('/admin/products', data, function (res) {
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
   } else {
     data._id = id;

     $.ajax({
       url: '/admin/products',
       data: data,
       method: 'put',
       success: function (res) {
         if(res === 'ok') {
           toastr["success"]("Cadastro atualizado com sucesso!");
           setTimeout(function(){
            location.reload();
          },1500);
           $('form').trigger('reset');
         } else {
           toastr["error"]("Erro: " + res);
          }
       }
     })
   }
 }
}

// LIMPA CAMPOS DO FORMULÁRIO
function clear (){
  $("#name").val("");
  $("#price").val("");
  $("#url").val("");
  $("#description").val("");
}


// EXCLUIR ITENS DA TABELA
$('.btn-remove').click(function () {
  $.ajax({
    url: '/admin/products/' + $(this).attr('id'),
    type: 'delete',
    success: function (r) {
      if (r == 'ok') {
        toastr["error"]("Produto removido!");
        setTimeout(function(){
          location.reload();
        },1500);
      } else {
        toastr["error"]("Produtos ", "Erro na exclusão");
      }
    }
  });
});

$('.btn-update').click(function () {
  $.ajax({
    url: '/api/products/' + $(this).attr('id'),
    success: function (r) {
      $("#id").val(r._id);
      $("#name").val(r.name);
      $("#price").val(r.price);
      $("#description").val(r.description);
      $("#url").val(r.url);
     }
  });
});

// PHONE MASK
$("#phone").mask("(99) 9999-9999?9")
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





function addToCart (product) {
  var cart = JSON.parse(sessionStorage.getItem("cart"));
  if (!cart) {
    cart = [];
  }

  var find = cart.find(function (item) {
    return item.id === product.id;
  });

  if (find) {
    find.quantity++;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  toastr["success"](product.name + " adicionado ao carrinho");
  sessionStorage.setItem("cart", JSON.stringify(cart));
  showCartItems();
}

$(document).ready(function () {
  $('#addProduct').click(function () {
    var id = $('#productId').val();
    $.get('/api/products/' + id, function (product) {
      addToCart(product);
    })
  });
});        