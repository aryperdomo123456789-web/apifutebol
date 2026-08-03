# Relatório de Extração de Lógica - Gerador Mago

Este documento resume a engenharia reversa aplicada ao painel gerador.pro para integração com a API FUT.

## Estrutura Técnica Identificada

### 1. Fluxo de Geração de Banner
- Modelos: Identificados 20 modelos ativos (modelo=14 até modelo=86).
- Controlador Principal: futebol/destaquecopa.php (Recebe POST).
- Engine de Renderização: Canvas dinâmico baseado em parâmetros de cores e JSON de partidas.

### 2. Mapeamento de Payload (POST)
- text_color (Hex)
- highlight_color (Hex)
- card_background_color (Hex)
- json_data (Objeto serializado contendo times, data, liga e odds)
- whatsapp_number (Opcional)

### 3. Estratégia de Migração para API FUT
A API FUT substituirá a necessidade de preenchimento manual do json_data usando o MediaService e NormalizerService.
