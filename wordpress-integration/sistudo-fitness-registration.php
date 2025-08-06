<?php
/**
 * Plugin Name: Sistudo Fitness Registration
 * Description: Integração com o sistema Sistudo Fitness para cadastro de clientes
 * Version: 1.0
 */

// Previne acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class SistudoFitnessRegistration {
    
    private $api_base_url;
    
    public function __construct() {
        $this->api_base_url = 'http://localhost:8080/api'; // Ajuste para sua URL
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_sistudo_register', array($this, 'handle_registration'));
        add_action('wp_ajax_nopriv_sistudo_register', array($this, 'handle_registration'));
        add_shortcode('sistudo_register_form', array($this, 'render_registration_form'));
    }
    
    public function init() {
        // Inicialização do plugin
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('sistudo-registration', plugin_dir_url(__FILE__) . 'js/registration.js', array('jquery'), '1.0', true);
        wp_enqueue_style('sistudo-registration', plugin_dir_url(__FILE__) . 'css/registration.css', array(), '1.0');
        
        // Localizar script para AJAX
        wp_localize_script('sistudo-registration', 'sistudo_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sistudo_registration_nonce')
        ));
    }
    
    public function render_registration_form($atts) {
        $atts = shortcode_atts(array(
            'redirect_url' => home_url('/login'), // URL de redirecionamento após sucesso
        ), $atts);
        
        ob_start();
        ?>
        <div class="sistudo-registration-wrapper">
            <form id="sistudo-registration-form" class="sistudo-auth-form">
                <div class="sistudo-form-header">
                    <h2>Cadastre-se no Sistudo Fitness</h2>
                    <p>Crie sua conta e comece sua jornada fitness</p>
                </div>
                
                <div class="sistudo-input-group">
                    <label for="username">Nome de usuário *</label>
                    <input type="text" id="username" name="username" required>
                    <span class="error-message" id="username-error"></span>
                </div>
                
                <div class="sistudo-input-group">
                    <label for="email">E-mail *</label>
                    <input type="email" id="email" name="email" required>
                    <span class="error-message" id="email-error"></span>
                </div>
                
                <div class="sistudo-input-group">
                    <label for="name">Nome completo *</label>
                    <input type="text" id="name" name="name" required>
                    <span class="error-message" id="name-error"></span>
                </div>
                
                <div class="sistudo-input-group">
                    <label for="cpf">CPF *</label>
                    <input type="text" id="cpf" name="cpf" required maxlength="14" placeholder="000.000.000-00">
                    <span class="error-message" id="cpf-error"></span>
                </div>
                
                <div class="sistudo-input-group">
                    <label for="password">Senha *</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" required>
                        <button type="button" class="password-toggle" data-target="password">
                            <span class="show-text">👁️</span>
                        </button>
                    </div>
                    <span class="error-message" id="password-error"></span>
                </div>
                
                <div class="sistudo-input-group">
                    <label for="confirm_password">Confirmar senha *</label>
                    <div class="password-wrapper">
                        <input type="password" id="confirm_password" name="confirm_password" required>
                        <button type="button" class="password-toggle" data-target="confirm_password">
                            <span class="show-text">👁️</span>
                        </button>
                    </div>
                    <span class="error-message" id="confirm-password-error"></span>
                </div>
                
                <div class="sistudo-form-actions">
                    <button type="submit" class="sistudo-btn-primary" id="submit-btn">
                        <span class="btn-text">Criar Conta</span>
                        <span class="btn-loading" style="display: none;">Criando conta...</span>
                    </button>
                </div>
                
                <div class="sistudo-form-messages">
                    <div id="success-message" class="success-message" style="display: none;"></div>
                    <div id="error-message" class="error-message" style="display: none;"></div>
                </div>
            </form>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Formatação de CPF
            $('#cpf').on('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    this.value = value;
                }
            });
            
            // Toggle de senha
            $('.password-toggle').on('click', function() {
                const target = $(this).data('target');
                const input = $('#' + target);
                const type = input.attr('type') === 'password' ? 'text' : 'password';
                input.attr('type', type);
                $(this).find('.show-text').text(type === 'password' ? '👁️' : '🙈');
            });
            
            // Submissão do formulário
            $('#sistudo-registration-form').on('submit', function(e) {
                e.preventDefault();
                
                const formData = {
                    action: 'sistudo_register',
                    nonce: sistudo_ajax.nonce,
                    username: $('#username').val(),
                    email: $('#email').val(),
                    name: $('#name').val(),
                    cpf: $('#cpf').val().replace(/\D/g, ''),
                    password: $('#password').val(),
                    confirm_password: $('#confirm_password').val(),
                    source: 'wordpress'
                };
                
                // Validações básicas
                if (formData.password !== formData.confirm_password) {
                    $('#confirm-password-error').text('As senhas não coincidem');
                    return;
                }
                
                // Mostrar loading
                $('#submit-btn').prop('disabled', true);
                $('.btn-text').hide();
                $('.btn-loading').show();
                
                // Enviar requisição
                $.ajax({
                    url: sistudo_ajax.ajax_url,
                    type: 'POST',
                    data: formData,
                    success: function(response) {
                        if (response.success) {
                            $('#success-message').text('Cadastro realizado com sucesso! Redirecionando...').show();
                            setTimeout(function() {
                                window.location.href = '<?php echo esc_url($atts['redirect_url']); ?>';
                            }, 2000);
                        } else {
                            $('#error-message').text(response.data.message || 'Erro ao criar conta').show();
                        }
                    },
                    error: function() {
                        $('#error-message').text('Erro de conexão. Tente novamente.').show();
                    },
                    complete: function() {
                        $('#submit-btn').prop('disabled', false);
                        $('.btn-text').show();
                        $('.btn-loading').hide();
                    }
                });
            });
        });
        </script>
        <?php
        return ob_get_clean();
    }
    
    public function handle_registration() {
        // Verificar nonce
        if (!wp_verify_nonce($_POST['nonce'], 'sistudo_registration_nonce')) {
            wp_die('Acesso negado');
        }
        
        // Sanitizar dados
        $data = array(
            'username' => sanitize_text_field($_POST['username']),
            'email' => sanitize_email($_POST['email']),
            'name' => sanitize_text_field($_POST['name']),
            'cpf' => sanitize_text_field($_POST['cpf']),
            'password' => $_POST['password'],
            'source' => 'wordpress'
        );
        
        // Validações
        if (empty($data['username']) || empty($data['email']) || empty($data['name']) || 
            empty($data['cpf']) || empty($data['password'])) {
            wp_send_json_error(array('message' => 'Todos os campos são obrigatórios'));
        }
        
        if ($_POST['password'] !== $_POST['confirm_password']) {
            wp_send_json_error(array('message' => 'As senhas não coincidem'));
        }
        
        // Enviar para API do Sistudo Fitness
        $response = $this->send_to_sistudo_api($data);
        
        if ($response && isset($response['success']) && $response['success']) {
            wp_send_json_success(array('message' => 'Cadastro realizado com sucesso!'));
        } else {
            $error_message = isset($response['message']) ? $response['message'] : 'Erro ao criar conta';
            wp_send_json_error(array('message' => $error_message));
        }
    }
    
    private function send_to_sistudo_api($data) {
        // Primeiro, criar o usuário
        $user_response = wp_remote_post($this->api_base_url . '/users', array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'ROLE_CLIENT'
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($user_response)) {
            return array('success' => false, 'message' => 'Erro de conexão com o servidor');
        }
        
        $user_body = wp_remote_retrieve_body($user_response);
        $user_data = json_decode($user_body, true);
        
        if (wp_remote_retrieve_response_code($user_response) !== 200) {
            return array('success' => false, 'message' => 'Erro ao criar usuário');
        }
        
        // Depois, criar o cliente
        $client_response = wp_remote_post($this->api_base_url . '/clients/create', array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'name' => $data['name'],
                'email' => $data['email'],
                'cpf' => $data['cpf'],
                'user' => $user_data
            )),
            'timeout' => 30
        ));
        
        if (is_wp_error($client_response)) {
            return array('success' => false, 'message' => 'Erro ao criar cliente');
        }
        
        if (wp_remote_retrieve_response_code($client_response) === 200) {
            return array('success' => true, 'message' => 'Cadastro realizado com sucesso!');
        } else {
            return array('success' => false, 'message' => 'Erro ao finalizar cadastro');
        }
    }
}

// Inicializar o plugin
new SistudoFitnessRegistration();
