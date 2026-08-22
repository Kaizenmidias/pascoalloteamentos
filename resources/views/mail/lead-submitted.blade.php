<!doctype html>
<html lang="pt-BR">
<body style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
    <h1 style="font-size:22px;color:#971c20">Novo lead pelo site Pascoal Loteamentos</h1>
    <p><strong>Nome:</strong><br>{{ $lead->name }}</p>
    <p><strong>E-mail:</strong><br>{{ $lead->email ?: 'Não informado' }}</p>
    <p><strong>Telefone:</strong><br>{{ $lead->phone }}</p>
    <p><strong>Origem:</strong><br>{{ $lead->metadata['source_label'] ?? 'Contato' }}</p>
    @if($lead->metadata['product_name'] ?? null)<p><strong>Produto:</strong><br>{{ $lead->metadata['product_name'] }}</p>@endif
    <p><strong>Mensagem:</strong><br>{!! nl2br(e($lead->message ?: 'Sem mensagem adicional.')) !!}</p>
    <p><strong>Página de origem:</strong><br>{{ $lead->source_url ?: 'Não informada' }}</p>
    <p><strong>Data/Hora:</strong><br>{{ $lead->created_at->timezone('America/Sao_Paulo')->format('d/m/Y H:i') }}</p>
</body>
</html>
