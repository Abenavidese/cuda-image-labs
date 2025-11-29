"""
Plantilla limpia para aplicaciones Flask + CUDA
Optimizada para GPUs RTX 50xx series (arquitectura sm_90)
"""

from flask import Flask
import numpy as np
import os
import subprocess
import tempfile
import pycuda.driver as cuda

# Inicializar CUDA
cuda.init()
device = cuda.Device(0)
context = device.make_context()

def compile_cuda_kernel(kernel_source, arch="sm_90"):
    """
    Compilar kernel CUDA usando nvcc directamente
    Args:
        kernel_source (str): Código fuente del kernel CUDA
        arch (str): Arquitectura CUDA (default: sm_90 para RTX 50xx)
    Returns:
        str: Código PTX compilado
    """
    # Crear archivo temporal
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cu', delete=False) as f:
        f.write(kernel_source)
        cu_file = f.name
    
    # Compilar a PTX
    ptx_file = cu_file.replace('.cu', '.ptx')
    cmd = ['nvcc', f'-arch={arch}', '--ptx', cu_file, '-o', ptx_file]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        os.unlink(cu_file)
        raise Exception(f"CUDA compilation failed: {result.stderr}")
    
    # Leer PTX
    with open(ptx_file, 'r') as f:
        ptx_code = f.read()
    
    # Limpiar archivos temporales
    os.unlink(cu_file)
    os.unlink(ptx_file)
    
    return ptx_code

def execute_cuda_kernel(kernel_source, function_name, input_data, block_size=(1,1,1), grid_size=(1,1)):
    """
    Función helper para ejecutar kernels CUDA fácilmente
    Args:
        kernel_source (str): Código fuente del kernel
        function_name (str): Nombre de la función kernel
        input_data (np.array): Datos de entrada
        block_size (tuple): Tamaño del bloque CUDA
        grid_size (tuple): Tamaño de la grilla CUDA
    Returns:
        np.array: Datos procesados
    """
    # Compilar kernel
    ptx_code = compile_cuda_kernel(kernel_source)
    module = cuda.module_from_buffer(ptx_code.encode())
    kernel_func = module.get_function(function_name)
    
    # Preparar datos
    data_gpu = cuda.mem_alloc(input_data.nbytes)
    cuda.memcpy_htod(data_gpu, input_data)
    
    # Ejecutar kernel
    kernel_func(data_gpu, block=block_size, grid=grid_size)
    
    # Recuperar resultado
    output_data = np.empty_like(input_data)
    cuda.memcpy_dtoh(output_data, data_gpu)
    
    # Limpiar memoria
    data_gpu.free()
    
    return output_data

# Crear aplicación Flask
app = Flask(__name__)

@app.route('/')
def index():
    """Ejemplo básico: sumar 1 a cada elemento de un array"""
    
    kernel_source = """
extern "C" {
__global__ void add_one(float *a) {
    int idx = threadIdx.x + blockIdx.x * blockDim.x;
    if (idx < 4) {
        a[idx] += 1.0f;
    }
}
}
"""
    
    try:
        # Datos de prueba
        input_array = np.array([1, 2, 3, 4], dtype=np.float32)
        
        # Ejecutar kernel
        result = execute_cuda_kernel(
            kernel_source, 
            "add_one", 
            input_array, 
            block_size=(4, 1, 1), 
            grid_size=(1, 1)
        )
        
        return f"Input: {input_array.tolist()} -> Output: {result.tolist()}"
        
    except Exception as e:
        return f"Error CUDA: {str(e)}"

@app.route('/multiply/<float:factor>')
def multiply_by_factor(factor):
    """Ejemplo avanzado: multiplicar array por un factor"""
    
    kernel_source = f"""
extern "C" {{
__global__ void multiply_by_factor(float *a, float factor) {{
    int idx = threadIdx.x + blockIdx.x * blockDim.x;
    if (idx < 4) {{
        a[idx] *= factor;
    }}
}}
}}
"""
    
    try:
        # Compilar y cargar kernel
        ptx_code = compile_cuda_kernel(kernel_source)
        module = cuda.module_from_buffer(ptx_code.encode())
        multiply_func = module.get_function("multiply_by_factor")
        
        # Datos de entrada
        data = np.array([1.0, 2.0, 3.0, 4.0], dtype=np.float32)
        
        # Alocar memoria GPU
        data_gpu = cuda.mem_alloc(data.nbytes)
        cuda.memcpy_htod(data_gpu, data)
        
        # Ejecutar kernel con parámetro
        multiply_func(
            data_gpu, 
            np.float32(factor),  # Parámetro adicional
            block=(4, 1, 1), 
            grid=(1, 1)
        )
        
        # Recuperar resultado
        result = np.empty_like(data)
        cuda.memcpy_dtoh(result, data_gpu)
        data_gpu.free()
        
        return f"Multiplicar por {factor}: {data.tolist()} -> {result.tolist()}"
        
    except Exception as e:
        return f"Error CUDA: {str(e)}"

if __name__ == "__main__":
    try:
        print("🚀 Servidor Flask + CUDA iniciando...")
        print(f"📊 GPU: {device.name()}")
        print(f"🏗️  Arquitectura: sm_90")
        app.run(host="0.0.0.0", port=5000, debug=False, threaded=False)
    finally:
        # Limpiar contexto CUDA
        try:
            context.pop()
        except:
            pass