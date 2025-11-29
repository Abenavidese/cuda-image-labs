from flask import Flask
import numpy as np
import os
import subprocess
import tempfile
import pycuda.driver as cuda

# Inicializar CUDA y crear contexto global
cuda.init()
device = cuda.Device(0)
context = device.make_context()

def compile_cuda_kernel(kernel_source, arch="sm_90"):
    """Compilar kernel CUDA usando nvcc directamente con arquitectura sm_90"""
    # Crear archivo temporal para el código CUDA
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cu', delete=False) as f:
        f.write(kernel_source)
        cu_file = f.name
    
    # Compilar a PTX usando nvcc
    ptx_file = cu_file.replace('.cu', '.ptx')
    cmd = ['nvcc', f'-arch={arch}', '--ptx', cu_file, '-o', ptx_file]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        # Limpiar archivos temporales en caso de error
        try:
            os.unlink(cu_file)
        except:
            pass
        raise Exception(f"CUDA compilation failed: {result.stderr}")
    
    # Leer el PTX generado
    with open(ptx_file, 'r') as f:
        ptx_code = f.read()
    
    # Limpiar archivos temporales
    os.unlink(cu_file)
    os.unlink(ptx_file)
    
    return ptx_code

app = Flask(__name__)

@app.route('/')
def index():
    # Kernel CUDA simple que suma 1 a cada elemento
    kernel_source = """
extern "C" {
__global__ void add_one(float *a) {
    int idx = threadIdx.x;
    if (idx < 4) {
        a[idx] += 1;
    }
}
}
"""
    
    try:
        # Compilar kernel con arquitectura sm_90
        ptx_code = compile_cuda_kernel(kernel_source, "sm_90")
        
        # Cargar el módulo PTX
        module = cuda.module_from_buffer(ptx_code.encode())
        add_one = module.get_function("add_one")
        
        # Datos de entrada
        a = np.array([1, 2, 3, 4], dtype=np.float32)
        
        # Alocar memoria en GPU
        a_gpu = cuda.mem_alloc(a.nbytes)
        cuda.memcpy_htod(a_gpu, a)
        
        # Ejecutar kernel
        add_one(a_gpu, block=(4, 1, 1), grid=(1, 1))
        
        # Copiar resultado de vuelta
        cuda.memcpy_dtoh(a, a_gpu)
        
        # Limpiar memoria
        a_gpu.free()
        
        return f"Resultado desde la GPU (sm_90): {a.tolist()}"
        
    except Exception as e:
        return f"Error CUDA: {str(e)}"

if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=5000, debug=False, threaded=False)
    finally:
        # Limpiar contexto CUDA al finalizar
        try:
            context.pop()
        except:
            pass
