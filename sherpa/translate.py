from flask import Flask, request, jsonify
from transformers import T5ForConditionalGeneration, T5Tokenizer

app = Flask(__name__)

# Load model and tokenizer
device = 'cpu'  # or 'cuda' for GPU
model_name = 'utrobinmv/t5_translate_en_ru_zh_small_1024'
model = T5ForConditionalGeneration.from_pretrained(model_name)
model.to(device)
tokenizer = T5Tokenizer.from_pretrained(model_name)

@app.route('/translate', methods=['POST'])
def translate():
    try:
        # Get input text from the POST request
        data = request.get_json()
        src_text = data.get('src_text', '')
        
        if not src_text:
            return jsonify({'error': 'src_text is required'}), 400

        # Translation logic
        prefix = 'translate to zh-hans: '
        input_ids = tokenizer(prefix + src_text, return_tensors="pt")
        generated_tokens = model.generate(**input_ids.to(device))
        result = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)

        # Return the result as JSON
        return jsonify({'translation': result[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


