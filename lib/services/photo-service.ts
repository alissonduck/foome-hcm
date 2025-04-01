/**
 * Serviço para gerenciar fotos de funcionários
 * Fornece métodos para listar, buscar, criar, atualizar e deletar fotos,
 * bem como fazer upload e download de imagens
 */
import { createClient } from "@/lib/supabase/server"
import { 
  EmployeePhoto,
  EmployeePhotoInsert,
  EmployeePhotoUpdate,
  PhotoUploadData,
  PhotoUploadResult
} from "@/lib/types/photo"

/**
 * Classe de serviço para fotos de funcionários
 */
export class PhotoService {
  /**
   * Obtém cliente do Supabase
   * @returns Cliente do Supabase
   */
  private async getSupabase() {
    return await createClient()
  }

  /**
   * Obtém a foto de um funcionário pelo ID do funcionário
   * @param employeeId ID do funcionário
   * @returns Foto do funcionário ou null se não encontrada
   */
  async getEmployeePhoto(employeeId: string): Promise<EmployeePhoto | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from("employee_photos")
      .select("*")
      .eq("employee_id", employeeId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  /**
   * Cria ou atualiza uma foto para um funcionário
   * Se já existir uma foto para o funcionário, atualiza; senão, cria
   * @param photo Dados da foto
   * @returns Foto criada ou atualizada
   */
  async upsertEmployeePhoto(photo: EmployeePhotoInsert): Promise<EmployeePhoto> {
    const supabase = await this.getSupabase()
    
    // Verificar se já existe uma foto para este funcionário
    const existingPhoto = await this.getEmployeePhoto(photo.employee_id)
    
    if (existingPhoto) {
      // Atualizar foto existente
      const { data, error } = await supabase
        .from("employee_photos")
        .update({ 
          admission_photo: photo.admission_photo,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingPhoto.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Criar nova foto
      const { data, error } = await supabase
        .from("employee_photos")
        .insert([photo])
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  /**
   * Remove a foto de um funcionário
   * @param employeeId ID do funcionário
   */
  async deleteEmployeePhoto(employeeId: string): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from("employee_photos")
      .delete()
      .eq("employee_id", employeeId)

    if (error) throw error
  }

  /**
   * Faz upload de uma foto para o storage do Supabase
   * @param uploadData Dados para upload (arquivo, caminho e tipo de conteúdo)
   * @returns Resultado do upload com caminho do arquivo ou erro
   */
  async uploadPhoto(uploadData: PhotoUploadData): Promise<PhotoUploadResult> {
    try {
      const supabase = await this.getSupabase()
      
      const { fileData, filePath, contentType } = uploadData
      
      // Função para gerar nomes de arquivo únicos baseados em timestamp
      const fileName = `${Date.now()}-${fileData.name.replace(/\s+/g, '-')}`;
      const fullPath = `${filePath}/${fileName}`;
      
      // Realizar o upload
      const { data, error } = await supabase.storage
        .from('employee-photos') // Nome do bucket
        .upload(fullPath, fileData, {
          contentType,
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }
      
      // Construir URL pública para o arquivo
      const { data: publicUrlData } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(fullPath);
      
      return {
        path: publicUrlData.publicUrl,
        error: null
      };
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      return {
        path: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
      };
    }
  }

  /**
   * Remove uma foto do storage do Supabase
   * @param path Caminho do arquivo a ser removido
   * @returns Resultado da operação
   */
  async deletePhotoFromStorage(path: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = await this.getSupabase()
      
      // Extrai o caminho relativo da URL (remover a parte do domínio e do bucket)
      let relativePath = path;
      
      // Se a URL for completa, extrair apenas o caminho relativo
      if (path.includes('employee-photos/')) {
        relativePath = path.split('employee-photos/')[1];
      }
      
      const { error } = await supabase.storage
        .from('employee-photos')
        .remove([relativePath]);
      
      if (error) {
        throw new Error(`Erro ao remover arquivo: ${error.message}`);
      }
      
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro ao remover foto do storage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao remover foto'
      };
    }
  }
} 