/* get_target
 * Funzione che restituisce il le coordinate xyz del centro di una geometria.
 * Può essere utile per ottenere il target da passare alla m4.lookAt
 * */
function get_target(){
var min_xyz=[], max_xyz=[];
  min_xyz=[vertices[0],vertices[1],vertices[2]];
  max_xyz=[vertices[0],vertices[1],vertices[2]];
  for (var k=0; k<vertices.length/3; k++)
      for (var j=0; j<3; j++){
        if (vertices[k+j] > max_xyz[j]) max_xyz[j] = vertices[k+j];
                else if (vertices[k+j] < min_xyz[j]) min_xyz[j] = vertices[k+j];
      }
  for (var k=0;k<vertices2.length/3;k++)
      for (var j=0; j<3; j++){
        if (vertices2[k+j] > max_xyz[j]) max_xyz[j] = vertices2[k+j];
                else if (vertices2[k+j] < min_xyz[j]) min_xyz[j] = vertices2[k+j];
      }
/* centro oggetto iniziale */
  target[0] = (min_xyz[0] + max_xyz[0])/2;
  target[1] = (min_xyz[1] + max_xyz[1])/2;
  target[2] = (min_xyz[2] + max_xyz[2])/2;
}